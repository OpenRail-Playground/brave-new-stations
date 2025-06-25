#Read in the paths (adjust if needed)
source("paths.R")


#Libraries
library(dplyr)
library(lubridate)
library(readr)
library(furrr)


library(tidymodels)
library(ranger)




#Read in the files

#Master Data
master <- read_delim(file = master_file)

#RIS
ris <- read_delim(file = ris_file)


#Pax-Files from folder
pax_files <- list.files(
  path       = pax_folder,
  pattern    = "\\.csv$",
  full.names = TRUE
)

#read in all files
pax <- do.call(
  rbind,
  lapply(pax_files, function(f) {
    df <- read_delim(f, delim = ";")
    df$source <- basename(f)
    df
  })
) %>% #unselect the source col
  select(-source) 
  


#join master to pax to get station id
master_join <- master %>%
  select(pax_counter_id, station_id)


pax <- pax %>%
  left_join(master_join, 
            by = "pax_counter_id")


#Drop unnecessary cols and select abfahrt only
ris_abfahrt <- ris %>%
  filter(case == "abfahrt") %>%
  select(zeit_echt, ereignis_station_id)



# #non-parallel computation
# pax <- pax %>%
#   rowwise() %>%
#   mutate(
#     abfahrt = any(
#       #same station
#       station_id == ris_abfahrt$ereignis_station_id &
#         #within +/- 10 min
#         abs(as.numeric(difftime(time_iot,
#                                 ris_abfahrt$zeit_echt,
#                                 units = "mins"))) <= 10
#     )
#   ) %>%
#   ungroup()


#parallel computation

#Windows - different for Linux: set up cores for parallel computation
plan(multisession, workers = availableCores() - 1)

#Compute in parallel
abfahrt_vec <- future_map_lgl(
  seq_len(nrow(pax)),
  function(i) {
    st <- pax$station_id[i]
    ti <- pax$time_iot[i]
    any(
      st == ris_abfahrt$ereignis_station_id &
        abs(as.numeric(difftime(ti,
                                ris_abfahrt$zeit_echt,
                                units = "mins"))) <= 10
    )
  }
)

pax_parallel <- pax %>%
  mutate(abfahrt = abfahrt_vec)

# #save the file
#saveRDS(pax_parallel, "pax.rds")

# #read the file with extra columns
# pax <- readRDS("pax.rds")


#add ID-column
pax_with_ids <- pax %>%
  #identify runs
  group_by(station_id) %>%
  arrange(time_iot, .by_group = TRUE) %>%
  mutate(
    run_id = 1 + cumsum(abfahrt != lag(abfahrt, default = first(abfahrt)))
  ) %>%
  ungroup() %>%
  
  #get a summary for each of the runs
  group_by(station_id, run_id) %>%
  summarise(
    run_abfahrt = first(abfahrt),
    .groups = "drop"
  ) %>%
  group_by(station_id) %>%
  arrange(run_id, .by_group = TRUE) %>%
  mutate(
    id_abfahrt_run      = if_else(run_abfahrt,      row_number(), 0L),
    id_interruption_run = if_else(!run_abfahrt,     row_number(), 0L)
  ) %>%
  ungroup() %>%
  
  #join back
  right_join(
    pax %>%
      group_by(station_id) %>%
      arrange(time_iot, .by_group = TRUE) %>%
      mutate(
        run_id = 1 + cumsum(abfahrt != lag(abfahrt, default = first(abfahrt)))
      ) %>%
      ungroup(),
    by = c("station_id", "run_id")
  ) %>%
  #get rid of NA-values
  mutate(
    id_abfahrt     = coalesce(id_abfahrt_run,      0L),
    id_interruption = coalesce(id_interruption_run, 0L)
  ) %>%
  select(-run_id, -run_abfahrt, -id_abfahrt_run, -id_interruption_run)





#add a id_station_time (convert timestamps to integer to find neighbouring points)
pax_with_ids <- pax_with_ids %>%
  group_by(station_id) %>%
  arrange(time_iot, .by_group = TRUE) %>%
  mutate(
    id_station_time = row_number()
  ) %>%
  ungroup()


#flag the outliers
flag_constant_outliers <- function(df, threshold = 2) {
  df %>%
    #arrange by runs
    group_by(station_id) %>%
    arrange(id_station_time, .by_group = TRUE) %>%
    mutate(
      pax_run_id = cumsum(data_pax != lag(data_pax, default = first(data_pax)))
    ) %>%
    #count the length of the run
    group_by(station_id, pax_run_id) %>%
    mutate(
      run_len = n()
    ) %>%
    ungroup() %>%
    #flag the outliers
    mutate(
      is_constant = (!abfahrt) & (run_len >= threshold) & (data_pax > 0)
    ) %>%
    #drop unnecessary cols
    select(-pax_run_id, -run_len)
}

pax_flagged <- flag_constant_outliers(pax_with_ids, threshold = 2)




#flag that is_constant sequence is not followed by abfahrt session
pax_flagged <- pax_flagged %>%
  group_by(station_id) %>%
  arrange(id_station_time, .by_group = TRUE) %>%
  mutate(
    #locate the next abfahrt
    next_abfahrt = lead(abfahrt, default = FALSE),
    #flag the rows
    is_not_followed_by_abfahrt = is_constant & (! next_abfahrt)
  ) %>%
  ungroup() %>%
  select(-next_abfahrt)


#flag that the the flagged sequence in is_constant is followed by a quick drop in up to 2 entries
#and does not increase
flag_drop_signal <- function(df,
                             drop_prop       = 0.5,  # fraction drop, e.g. 0.5 → 50%
                             drop_after_n    = 2,    # must occur within first 3 rows
                             overrun_after_n = 4     # must hold for first 6 rows
) {
  #annotate the runs and the position of the rows
  df2 <- df %>%
    group_by(station_id) %>%
    arrange(id_station_time, .by_group = TRUE) %>%
    mutate(
      pax_run_id  = cumsum(data_pax != lag(data_pax, default = first(data_pax))),
      run_value   = first(data_pax),
      run_outlier = first(is_constant),
      lead1 = lead(data_pax, 1),
      lead2 = lead(data_pax, 2),
      lead3 = lead(data_pax, 3),
      lead4 = lead(data_pax, 4),
      lead5 = lead(data_pax, 5),
      lead6 = lead(data_pax, 6),
      is_run_end = (lead(pax_run_id, 1) != pax_run_id) | is.na(lead(pax_run_id, 1))
    ) %>%
    ungroup()
  
  #check the positions
  runs_signals <- df2 %>%
    filter(is_run_end, run_outlier) %>%
    transmute(
      station_id,
      pax_run_id,
      drop_within = (
        coalesce(lead1 <= run_value * drop_prop, FALSE) |
          coalesce(lead2 <= run_value * drop_prop, FALSE) |
          coalesce(lead3 <= run_value * drop_prop, FALSE)
      ),
      no_overrun = (
        coalesce(lead1 <= run_value, FALSE) &
          coalesce(lead2 <= run_value, FALSE) &
          coalesce(lead3 <= run_value, FALSE) &
          coalesce(lead4 <= run_value, FALSE) &
          coalesce(lead5 <= run_value, FALSE) &
          coalesce(lead6 <= run_value, FALSE)
      ),
      is_drop_signal = drop_within & no_overrun
    )
  
  #join back
  df2 %>%
    left_join(runs_signals, by = c("station_id", "pax_run_id")) %>%
    mutate(
      is_drop_signal = coalesce(is_drop_signal, FALSE)
    ) %>%
    #drop unnecessary cols
    select(-pax_run_id, -run_value, -run_outlier,
           -lead1, -lead2, -lead3, -lead4, -lead5, -lead6,
           -is_run_end, -drop_within, -no_overrun)
}

#use the function
pax_final <- pax_flagged %>% 
  flag_drop_signal()


# #save the file
#saveRDS(pax_final, "pax_flags.rds")


pax_final <- pax_final %>%
  mutate(final_flag = (is_constant == TRUE & is_not_followed_by_abfahrt == TRUE & is_drop_signal == TRUE))




#Modelling - select only one single station - for H4R purpose
data <- pax_final %>%
  filter(station_id == 3930)



#extract the modelling data with extra info about the time
model_data <- data %>%
  mutate(
    # continuous‐time feature
    time_decimal = hour(time_iot) + minute(time_iot) / 60,
    # German weekdays, Monday=1 … Sunday=7
    weekday = factor(
      wday(time_iot, week_start = 1),
      levels = 1:7,
      labels = c(
        "Montag", "Dienstag", "Mittwoch",
        "Donnerstag", "Freitag", "Samstag", "Sonntag"
      )
    ),
    # weekend flag
    is_weekend = weekday %in% c("Samstag", "Sonntag"),
    # ensure response is a factor
    final_flag = factor(final_flag, levels = c(FALSE, TRUE))
  ) %>%
  select(
    final_flag,
    data_pax,
    weekday,
    time_decimal,
    is_weekend,
    time_iot
  )

# # inspect the data types
# model_data %>% glimpse()



#Modelling: using the whole dataset with a Cross-Validation


#build the training data
train_data <- model_data %>%
  mutate(
    weekday      = as.numeric(factor(
      wday(time_iot, week_start = 1),
      levels = 1:7,
      labels = c( #using german weekdays - switch to EN if necessary
        "Montag", "Dienstag", "Mittwoch",
        "Donnerstag", "Freitag", "Samstag", "Sonntag"
      )
    )),
    #convert everything to numeric variables
    #extract time
    time_decimal = as.numeric(hour(time_iot) + minute(time_iot)/60),
    #flag weekends
    is_weekend   = as.numeric(weekday %in% c(6, 7)), #select saturday/sunday
    data_pax     = as.numeric(data_pax)
  ) %>%
  select(final_flag, data_pax, weekday, time_decimal, is_weekend)

#set seed and select CV-parameters
set.seed(42)
folds <- vfold_cv(train_data, v = 3, strata = final_flag)

#use a shared modelling recipe
rec <- recipe(final_flag ~ data_pax + weekday + time_decimal + is_weekend,
              data = train_data) %>%
  step_dummy(all_nominal_predictors()) %>%  #one-hot if needed
  step_zv(all_predictors())                 #drop zero-variance cols just to be sure

#Set up the models- LR/RF/XGB
log_spec <- logistic_reg(mode = "classification") %>%
  set_engine("glm")

rf_spec  <- rand_forest(mode = "classification", trees = 300) %>%
  set_engine("ranger")

xgb_spec <- boost_tree(mode = "classification",
                       trees = 300, tree_depth = 5, learn_rate = 0.1) %>%
  set_engine("xgboost")

#Set up the WFS
wf_log <- workflow() %>% add_recipe(rec) %>% add_model(log_spec)
wf_rf  <- workflow() %>% add_recipe(rec) %>% add_model(rf_spec)
wf_xgb <- workflow() %>% add_recipe(rec) %>% add_model(xgb_spec)

#Fit with CV
ctrl <- control_resamples(save_pred = TRUE)

res_log <- fit_resamples(wf_log,  folds, metrics = metric_set(accuracy, roc_auc, precision, recall, f_meas), control = ctrl)
res_rf  <- fit_resamples(wf_rf,   folds, metrics = metric_set(accuracy, roc_auc, precision, recall, f_meas), control = ctrl)
res_xgb <- fit_resamples(wf_xgb,  folds, metrics = metric_set(accuracy, roc_auc, precision, recall, f_meas), control = ctrl)

#Collect eval metrics
log_metrics <- collect_metrics(res_log)  %>% select(.metric, mean) %>% rename(logistic = mean)
rf_metrics  <- collect_metrics(res_rf)   %>% select(.metric, mean) %>% rename(rf       = mean)
xgb_metrics <- collect_metrics(res_xgb)  %>% select(.metric, mean) %>% rename(xgb      = mean)

comparison <- reduce(
  list(log_metrics, rf_metrics, xgb_metrics),
  left_join, by = ".metric"
) %>%
  rename(Metric = .metric)


#comparison

# save the file
#saveRDS(comparison, "model_comparison.rds")





