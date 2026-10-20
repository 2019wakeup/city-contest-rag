<!--
SOURCE: 原始 PDF: reference/背景知识/2023-Road Materials and Pavement Design-Prediction of network level pavement treatment types using multi-classification machine learning algorithms.pdf | 页数: 18 | 集合: reference
题录: litfull-032 Prediction of network level pavement treatment types using multi-classification machine le (DOI: 10.1080/14680629.2021.2019091)
提取: MinerU markdown 全文（可重建索引的真相源副本；images/ 不入 corpus）
-->
# Prediction of network level pavement treatment types using multi-classification machine learning algorithms

**Fritz J. Jooste, Seosamh B. Costello & Sean Rainsford**

**To cite this article:** Fritz J. Jooste, Seosamh B. Costello & Sean Rainsford (2023) Prediction of network level pavement treatment types using multi-classification machine learning algorithms, Road Materials and Pavement Design, 24:2, 410-426, DOI: [10.1080/14680629.2021.2019091](https://www.tandfonline.com/action/showCitFormats?doi=10.1080/14680629.2021.2019091)

**To link to this article:** [https://doi.org/10.1080/14680629.2021.2019091](https://doi.org/10.1080/14680629.2021.2019091)

![](images/page_0_image_8.jpg)

Published online: 19 Jan 2022.

![](images/page_0_image_10.jpg)

[Submit your article to this journal](https://www.tandfonline.com/action/authorSubmission?journalCode=trmp20&show=instructions&src=pdf) $区$

![](images/page_0_image_12.jpg)

Article views: 432

![](images/page_0_image_14.jpg)

[View related articles](https://www.tandfonline.com/doi/mlt/10.1080/14680629.2021.2019091?src=pdf)

![](images/page_0_image_16.jpg)

[View Crossmark data](http://crossmark.crossref.org/dialog/?doi=10.1080/14680629.2021.2019091&domain=pdf&date_stamp=19%20Jan%202022) $区$

![](images/page_0_image_18.jpg)

[Citing articles: 6 View citing articles](https://www.tandfonline.com/doi/citedby/10.1080/14680629.2021.2019091?src=pdf)

Check for updates

# Prediction of network level pavement treatment types using multi-classification machine learning algorithms

Fritz J. Jooste<sup>a</sup>, Seosamh B. Costello b, and Sean Rainsford<sup>c</sup>

<sup>a</sup>Director, Lonrix Ltd, Hamilton, New Zealand; <sup>b</sup>Associate Professor, Department of Civil and Environmental Engineering, The University of Auckland, Auckland, New Zealand; <sup>c</sup>Technical Asset Manager, Fulton Hogan, Christchurch, New Zealand

## ABSTRACT

The challenge in pavement management is to ensure that the correct treatment is applied to each segment of road at the appropriate time. Although pavement management systems assist with such predictions, pavement engineers further investigate and, ultimately, decide on the timing and type of treatment to be applied. While it is understandable that these might differ to some extent, large disparities between the two are coming under increased scrutiny. In order to assist with this challenge, this research develops a model for the prediction of pavement treatment types using multi-classification machine learning algorithms. The model attempts to predict what particular treatment type (reseal, overlay or rehabilitation) would be undertaken, based on available inventory and condition data. It also highlights the categories of data that were most influential in the prediction. The model was over 82% accurate in predicting the untreated segments and 80% accurate in predicting the treated segments.

## ARTICLE HISTORY

Received 23 February 2021

Accepted 11 December 2021

## KEYWORDS

Pavement management; machine learning; forward works planning; treatment classification; prediction; pavement maintenance

## Introduction

Decision making in pavement management ultimately results in the application of a particular maintenance treatment, on a particular segment of road, at a particular point in time. The challenge being to ensure that the appropriate treatment is applied to each segment of road at the appropriate time (Costello & Snaith, 2015). Although practices will vary from country to county, and even state to state, typically a pavement management system of some description will help develop a forward works programme (FWP) based on the inventory, condition, loading, historical maintenance and other information available in the road database, subject to budget constraints. The in-built logic in the pavement management system, possibly combined with a life-cycle analysis of the costs and benefits as well as the optimisation of some objective function, will recommend a limited list of segments to be treated in a particular year and, for each segment, a recommended treatment type. The pavement engineer will further investigate this list of segments and will, ultimately, decide on the appropriate treatment based on the information available, using their professional judgement and experience. The refinement and validation of an indicative FWP by the pavement engineer typically involves undertaking field inspections, a costly, time-consuming and potentially hazardous operation.

While it is understandable that the treatment type predicted by the pavement management system and that ultimately decided by the pavement engineer might differ to some extent, large disparities between the two are coming under increased scrutiny. In New Zealand, for example, the national

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">CONTACT Seosamh B. Costello [s.costello@auckland.ac.nz](mailto:s.costello@auckland.ac.nz)</span></small>

Transport Agency has acknowledged the need for better alignment between the two. In their Network Outcomes Contracts (NOCs), one of the measures of contractor performance is the alignment of the modelled FWP with the actual programme delivered in terms of pavement renewals found to be deferred or advanced (NZTA, 2020). In addition, the stability of the modelled FWP, in terms of change in type or timing of treatments, is assessed between successive annual programme submissions. More generally, it is agreed by experienced practitioners (Parkman et al., 2003) that a holistic validation of model-assigned treatments is needed before an operational FWP is implemented.

Given the above, there is a need to augment traditional decision support systems with methods that rely on a broader set of parameters. Given the availability of extensive historical data in most road agencies, Machine Learning models that are able to use historical road condition and inventory data to classify likely upcoming treatments (if any), are a natural candidate for augmenting traditional pavement management system outputs.

Although an emerging technology, the application of Machine Learning to pavement engineering problems is not new, with various Machine Learning algorithms being used for condition assessment and performance prediction. Recent applications include the prediction of roughness (Gong et al., 2018a; Marcelino et al., 2019; Ziari et al., 2016), rutting (Gong et al., 2018b), cracking (Inkoom et al., 2019a; Inkoom et al., 2019b; Majidifard et al., 2020; Mandal et al., 2018), friction (Marcelino et al., 2017), and the Pavement Condition Index (PCI) (Barua et al., 2021). Barua et al. (2021) also provides a summary of the literature on machine learning models used for pavement condition prediction. Other applications of machine learning are not as prevalent in the literature, but do include optimisation of maintenance planning (Yao et al., 2020), optimising expert-based pavement maintenance networklevel decisions (Hafez et al., 2019) and predicting maintenance alerts and associated interventions (Morales et al., 2020). The latter is the most closely related to the present study. For a more comprehensive review of the literature, the reader is referred to Ceylan et al. (2014), who specifically focusses on Neural Networks applications in pavement engineering, and a state-of-the-art review of predictive pavement maintenance included in Morales et al. (2020).

The objective of this study is to explore and evaluate the potential of using Machine Learning models to derive an evidence-based model to predict (a) where treatments are likely to be needed within the next financial year; and (b) what type of treatment is most likely to be needed, if any. If successful, such a Machine Learning model can be used in the following ways:

• To compare the treatment assignments made by the long-term deterioration model for the first modelling year and, thereby, test the overall validity and stability of the model output.

To serve as a screening tool to reduce the amount of time required to undertake field validation of potential candidates for treatment in the next financial year, a costly, time-consuming and potentially hazardous operation.

## Machine learning

Over the past decade, the science of Machine Learning (ML) models has expanded significantly into all areas of business and engineering. The growing interest in ML applications has been fuelled to a large extent by the widespread availability of open source ML frameworks such as Scikit-Learn (Pedregosa et al., 2011) and R (R Development Core Team, 2010). In this study, we relied on the Python-based Scikit-Learn framework to evaluate the potential for ML to predict upcoming locations and types of treatments. The attraction of using Scikit-Learn is its generic nature and ease of use, thereby allowing non-specialists to adopt machine learning. In addition, it includes a wide variety of machine learning algorithms, enabling easy comparison of methods for a given application (Pedregosa et al., 2011). It should be noted that there is a wealth of information readily available online with regards to machine learning in general, and also on the specific model used in this study, which can be defined as a multi-class classification problem.

Consequently, we will not attempt to explain the basis of machine learning models in general, nor the particular models used for this study. Instead, we have decided to use available space to focus on the civil engineering aspects of the problem, clarification of the available data and – most importantly – on a pragmatic assessment of the fitness-for-purpose of the final model.

The approach adopted in this study was to utilise the extensive set of historical pavement condition and inventory data available in mature road agency systems, such as those of the New Zealand Transport Agency. In addition to this set of ‘big data’, recorded instances of completed road maintenance projects were also utilised. These completed road maintenance projects would have been decided by the pavement engineer based on the information available, using their professional judgement and experience. These two sources of data were then combined to establish a set of data where the available pavement condition and inventory data in the period immediately preceding a treatment could be related to the type of treatment chosen by the pavement engineer. The intention then was to train the ML model with a proportion of the data and validate the accuracy of the ML model with the remaining, holdout test dataset.

The paper first outlines the challenges to building an appropriate analysis dataset, along with recommended solutions, including data processing requirements, how to deal with class imbalances and missing data, and sampling approaches for selecting the training and testing datasets. The metrics by which to evaluate the accuracy of the model are then detailed, before the efficacy of various ML classification models are evaluated and the number of available predictor variables refined. Finally, the performance of the final selected model is discussed before conclusions are presented.

## Analysis dataset

Given that the Network Outcomes Contracts (NOCs) in New Zealand explicitly include measures of contractor performance relating to the alignment of the modelled FWP with the actual renewal programme delivered, it was decided to develop the model using data from New Zealand. Specifically, for this study, data from four of the Network Outcome Contracts (NOC) networks managed by Fulton Hogan contractors were used. These were the Wellington, Northland, West Coast and Central Otago NOC networks, representing 5,600 lane kilometres of state highways between them.

In New Zealand, there is a wealth of historical condition data related to State Highways. Indeed, consistent annual high-speed data surveys have been conducted on all State Highways for at least 20 years. These surveys measure road condition parameters such as rutting, roughness, skid resistance and texture depth. Consistent and well-structured storage of this data means that most consultants and contractors working on New Zealand State Highways have access to a wealth of data by means of which to plan operational works, prioritise treatments and justify strategic decisions. The annual high-speed data is augmented by information related to surfacing attributes such as surface type, date placed, and materials used. Road maintenance information is also recorded and stored with the high-speed data in a national database to which practitioners have access.

## Approach to building an analysis dataset

The data set used for this analysis was constructed using data stored in the JunoViewer asset management system (Lonrix, 2020) which is widely used in New Zealand for managing network data and decisions. The cornerstone of the data set was the list of completed projects which is held in the JunoViewer database. This list of projects contains details about each completed project (e.g. location, project type, date of completion) and forms the basis for post-construction performance reports required by the New Zealand Transport Agency as part of the Network Outcomes Contracts (NOCs) (NZTA, 2020).

The approach to developing the data set was to extract, for each completed project, a ‘fingerprint’ of the road condition in the years preceding the financial year in which the project was completed and, similarly, for segments where a project wasn’t completed. This concept is illustrated in Figure 1.

![](images/page_4_image_3.jpg)

Figure 1. Schematic illustration of condition ‘fingerprint’ before project year.

In this figure, the dots represent survey data for a condition parameter (e.g. rut depth) on a segment where a project was completed.

As shown in Figure 1, the aim was to find, for each project, the condition of the road based on (a) the latest condition survey before the start of the financial year in which the project was completed; and (b) the condition trend over the preceding three years. The intention was to mirror the information available to the operational manager who needs to make decisions at the start of the financial year, based on the last available survey data coupled with recent trends in the condition data.

The condition parameters used for this study are summarised in Table 1 and include rut depth, roughness, texture depth, skid resistance, historical maintenance data, surfacing data and other general information, including traffic and loading data.

## Data processing

A data processing algorithm was developed and incorporated into the JunoViewer framework specifically to extract data in a format that could be used by the ML classification algorithm. The process of building the analysis set proceeded in two stages: the first stage focused on building a combined set of network segments that were either treated or untreated in each of the financial years which ranged from 2015 to 2020. The second stage involved the running of an algorithm to extract, for each analysis segment, the information shown in Table 1 from the historical data available in the asset management system database.

In the first stage, we extracted all of the segments where projects had been completed. This set was referred to as the ‘treatment’ set. Next, we constructed a set of segments to represent the condition where no treatment was applied in the following financial year. This set is referred to as the ‘no treatment’ set, or the set with treatment code ‘none’.

The ‘no treatment’ set was built by dividing each network into segments, the length of which matched the median project segment length for that network (rounded to the nearest 25 m). This set of ‘no treatment’ segments was then applied to all five financial years of interest (2015–2020). Thus, effectively, each of the ‘no treatment’ segments were assigned a ‘project financial year’ but with a project type of ‘none’. These year-specific segment sets were then scanned and any segment that was found to overlap with a project segment for that year (i.e. a segment where a project was actually constructed) was removed from the set since it was effectively not a ‘no-treatment’ segment in that year. Finally, the ‘treatment’ and ‘no treatment’ sets were combined into an overall dataset.

The final data preparation step involved a data join algorithm to calculate, for each segment in the combined set, all of the parameters and statistics shown in Table 1. For the four networks included in this analysis, this resulted in a modelling set with 28,556 segments (rows) in total and 58 attributes associated with each segment (including the treatment type).

Table 1. Condition parameters considered in the prediction model.

| Data Type | Details | Statistical/Other Parameters Used | Comment |
| --- | --- | --- | --- |
| Rut depth in left wheel path | Averages over 20 metres over the segment length | 95th percentile 90th percentile 85th percentile Median Mean Rate of change on all of the above statistics, as well as | Values in last survey before project financial year, and Rates of Change over last three years before the project financial year |
| Roughness (Naasra counts) |  | $\mathsf { R } ^ { 2 }$ trend | value on |
| Texture depth in left wheel path | Averages over 10 metres over the segment length | 80th percentile 20th percentile Median |  |
| Skid Resistance (SCRIM) | 10 metre SCRIM | Mean Rate of change on all of the above statistics, as well as trend % of SCRIM points below IL | $\mathsf { R } ^ { 2 }$ value on |
| Data Maintenance data | points vs Investi- gatory Level (IL) requirement Pavement and surface | Slope (rate of change) of % below IL over time Number of actions | Values over the |
| Surfacing data | maintenance only Last surfacing placed | Maintenance Cost Surface type | financial year preceding the project financial year The surfacing selected |
|  | before project | Surface age Surface function | was the latest surfacing that has at least a 50% overlap with the segment in question |
| General information | Information about the road carriageway | Terrain type Urban/Rural ONRC Class* AADT$ |  |

∗ ONRC = One Network Road Classification [https://nzta.govt.nz/roads-and-rail/road-efficiency-group/projects/onrc]

§AADT = Annual Average Daily Traffic

†ESA = Equivalent Single Axles

Table 2. Breakdown of treatment types in analysis set.

| Treatment Type | Label (coding) | Number ofOccurrences | % ofOccurrences |
| --- | --- | --- | --- |
| No Treatment | 'none' (code 0) | 26,878 | 94.1% |
| Surface Seal | 'Chipseal' (code 1) | 1,198 | 4.2% |
| Asphalt Overlay | 'Asphalt' (code 2) | 366 | 1.3% |
| Rehabilitation | 'Rehabilitation' (code 3) Total | 11428,556 | 0.4%100.0% |

## Class imbalance

There were four treatment types in the data set which formed the target values to be predicted. The breakdown of these treatment types over the full data set is summarised in Table 2.

Table 2 shows that the data set was significantly skewed toward ‘No Treatment’ situations, with a total of 94% of data rows having the treatment label ‘none’. This scenario represents a ‘class imbalance problem’ (Kubat, 2015; Lemaitre et al., 2017), in which the class with the majority of cases (‘none’) is typically referred to as the majority class while the classes with fewer cases are termed the minority class or classes (Kubat, 2015).

Table 3. Breakdown of training and test sets.

<table><tbody><tr><td></td><td colspan="2">Training Set</td><td colspan="2">Test Set</td></tr><tr><td>Treatment Type</td><td>Count</td><td>Percent</td><td>Count</td><td>Percent</td></tr><tr><td>No Treatment</td><td>1266</td><td>50.0%</td><td>317</td><td>50.0%</td></tr><tr><td>Surface Seal</td><td>958</td><td>37.8%</td><td>240</td><td>37.9%</td></tr><tr><td>Asphalt Overlay</td><td>217</td><td>8.6%</td><td>54</td><td>8.5%</td></tr><tr><td>Rehabilitation</td><td>91</td><td>3.6%</td><td>23</td><td>3.6%</td></tr><tr><td>Total</td><td>2532</td><td>100.0%</td><td>634</td><td>100.0%</td></tr></tbody></table>

Using this imbalanced set to train the model is likely to compromise the machine learning process because examples from the majority class overwhelm the minority class. Furthermore, most of the standard machine learning algorithms expect a balanced class distribution (Lemaitre et al., 2017). This problem is quite common in machine learning, as well as in data mining and pattern recognition.

Finally, on New Zealand state highways, the conversion of a seal to an asphalt surfacing by means of an overlay is relatively rare and is likely to be decided by unforeseen political and location specific aspects rather than by road condition. For this reason, it was decided to remove all rows where asphalt was placed on an existing seal. This meant the removal of 95 rows from the data set.

## Sampling approach for training and testing datasets

In machine learning, it is standard practice to set aside a test set that can be used to objectively evaluate the model performance after training. The size of the test set is generally around 20% of the total data size, with the remaining 80% being used to train the model (Geron, 2017). For this study a 80:20 training-to-testing data split was used.

As pointed out in the preceding section, the data set used for this study suffered from severe imbalance. To address this problem, the procedure for selecting test-and-training sets implemented the following steps:

(1) The ‘no treatment’ majority class was under-sampled such that the size of the ‘no treatment’ group in the test and training sets was the same as the total size of the combined sets where treatments were applied.

(2) To ensure that the breakdown of treatment groups (including treatment group ‘none’) was the same for the training and testing sets, the Scikit-Learn Stratified Shuffle Split tool (Pedregosa et al., 2011) was used to create test and training sets. This algorithm randomly samples from the full data set in a way that the percentage of samples in each class is retained.

The method of under-sampling noted in step 1 above is one of two commonly used methods to deal with class imbalance (Kubat, 2015). As stated above, under-sampling consists of taking a smaller sample from the majority class. The other method is known as oversampling and involves duplication of the samples in the minority class. Under-or-oversampling can be random, or it can involve more sophisticated methods to select samples that best represent each of the majority-or-minority classes. Examples of such techniques include Synthetic Minority Over-sampling Technique (SMOTE) and Edited Nearest Neighbours (ENN) (Lemaitre et al., 2017).

While some of these more sophisticated techniques were investigated as part of this study, exploratory analysis indicated that they did not result in a significant improvement of outcomes. Thus, a random under-sampling of the ‘no treatment’ class was used to obtain a balanced dataset.

Table 3 shows the final breakdown of the treatment classes in the training and testing sets. It can be seen from this table that the Stratified Shuffle Split has maintained the relative percentage of instances in each treatment class.

Table 4. Metrics for evaluation of classification models.

<table><tr><td>Metric Name</td><td>Definition</td><td>Comment</td></tr><tr><td rowspan="2">Accuracy</td><td> $T P$ </td><td>Number of true positives as a fraction of all</td></tr><tr><td> $\overline { { N } }$ </td><td>estimates. Can be highly misleading in the case of imbalanced datasets.</td></tr><tr><td>Precision</td><td> $\frac { T P } { T P + F P }$ </td><td>Indication of the accuracy of positive predictions.</td></tr><tr><td rowspan="2">Recall or Sensitivity</td><td> $\frac { T P } { T P + F N }$ </td><td>Also called the true positive rate. Ratio of positive instances that are correctly</td></tr><tr><td></td><td>detected.</td></tr><tr><td rowspan="2">F1 Score</td><td> $2 * { \frac { p r e c i s i o n * r e c a l l } { p r e c i s i o n + r e c a l l } }$ </td><td>Harmonic mean of precision and recall scores.</td></tr><tr><td></td><td>F1 favours classifiers that have similar precision and recall.</td></tr></table>

Note: TP = True Positive; FP = False Positive; FN = False Negative;

## Treatment of missing data

There were missing data in one or more columns for 3644 of the final 28,461 rows. The causes of missing data were (a) no survey data available for one or more years (which may also render the calculation of deterioration rates invalid); (b) unknown or missing information (e.g. surface information or traffic information). In machine learning practice, missing values can be either omitted from the data set, or the missing values can be imputed – that is, estimated based on the available data (Kuhn & Johnson, 2013).

Given the relatively small number of data rows with missing values in one or more columns, we considered simply deleting the missing values. However, closer inspection of the rows with missing values showed that 86 of the 114 rows where rehabilitation was applied had missing surfacing information. Deleting these rows would have significantly reduced the already small set with rehabilitation treatments. Thus, some form of imputation had to be used.

There are many different approaches to imputing missing values. These range from simply replacing all missing values with the median (or mode for categorical variables), to more sophisticated approaches such as Nearest Neighbour Estimation (Kuhn & Johnson, 2013) or regression to determine missing values based on other available predictors.

The Scikit-Learn framework provides various imputer classes that can be used for automated imputation on missing values. For this study, the Scikit-learn Nearest Neighbour estimator (Pedregosa et al., 2011), as well as the Iterative Multivariate Imputer (Pedregosa et al., 2011; van Buuren & Groothuis-Oudshoorn, 2011) were tested. The latter imputer was found to give slightly better results and was adopted for the final prediction.

## Model evaluation metrics

The evaluation of multi-class classification outputs is somewhat complex owing to the different interpretations that can be attributed to the outcome based on context. In machine learning there are several metrics that can be used to evaluate how well a multiclass classification algorithm performs. Some of the most well-known metrics are summarised in Table 4, including Accuracy, Precision, Recall (or Sensitivity) and F1 Score. The definitions and comments shown in Table 4 are after Kuhn and Johnson (2013), Kubat (2015) and Geron (2017).

In the present context, a True Positive would represent a case where the model correctly predicted a treatment type. When working with multi-class classifiers, the interpretation of the metrics in Table 4 become more complex since each class has its own subset of True Positives, False Positives and False Negatives. Furthermore, in the case of imbalanced datasets, interpretation of the standard metrics may be misleading.

Table 5. Example confusion matrix.

<table><tr><td rowspan=2 colspan=2></td><td colspan=4>Predicted</td></tr><tr><td>None</td><td>Chipseal</td><td>Asphalt</td><td>Rehabilitation</td></tr><tr><td rowspan=4>Oseyed</td><td>None</td><td>257</td><td>47</td><td>13</td><td>0</td></tr><tr><td>Chipseal</td><td>50</td><td>186</td><td>4</td><td>2</td></tr><tr><td>Asphalt</td><td>9</td><td>1</td><td>44</td><td>0</td></tr><tr><td>Rehabilitation</td><td>4</td><td>10</td><td>1</td><td>8</td></tr></table>

Table 6. Cost-based index used in scoring of classification models.

| Outcome | Area in Table 6 | Score Assigned to Observation |
| --- | --- | --- |
| Treatment type correctly predicted | Grey and bold | 10 |
| 'none' predicted where treatment was observed | Red highlight | -10 |
| Lesseffectivetreatmentpredictedthan was observed | Orange Highlight | -3 |
| Some treatment predicted where no treatment was observed | Yellow Highlight | -1 |
| Moreeffectivetreatmentwaspredicted | Green Highlight | 1 |
| than was observed∗ |  |  |

∗ Rehabilitation is deemed most effective; Asphalt overlay medium; Chipseal least effective.

For example, consider a binary model in which we are trying to predict whether a rehabilitation will be required in the next year. The alternatives are ‘none’ or ‘rehabilitation’. If there are 100 observations on which 95 were assigned ‘none’ and the remaining five ‘rehabilitation’, then a simple model that pre-dicts ‘none’ all the time would have a 95% accuracy even though it did not predict one rehabilitation correctly.

For this reason, a direct assessment of the ‘confusion matrix’ is often recommended (Kubat, 2015; Kuhn & Johnson, 2013 and Geron, 2017). An example of a confusion matrix obtained with one of the models used in this study is shown in Table 5. A key issue in assessing a confusion matrix is the relative importance of True Positives, False Negatives and False Positives.

In the context of pavement asset management in which we are trying to accurately predict upcoming treatment needs, a False Positive means that a treatment is assigned where it is not needed, or a more effective, and therefore expensive, treatment has been assigned than is actually needed. Such false positives can be identified and corrected through field inspection, and the cost associated with this misclassification is related to the resources needed to inspect and correct the prediction.

On the other hand, a False Negative means that a segment in need of treatment is not assigned a treatment, or a less effective treatment is assigned than needed. Where a less effective treatment is assigned, this can be identified and corrected through field inspection as detailed above. However, as segments that are not assigned any treatment will disappear into the larger set of ‘no treatment’ predictions, there is no way of knowing that this is a false negative. The consequences of a false negative are therefore under-estimation of budget needs and not treating a segment when it may be most appropriate to do so.

This type of reasoning can be used to build a context specific cost-score based on the confusion matrix (Kuhn & Johnson, 2013). For this study, the cost-function summarised in Table 6 was adopted to score and compare the various models. The values in the confusion matrix, although necessarily subjective in nature, reflect the relative importance of True Positives, False Negatives and False Positives in the pavement management context, as outlined above. The reader can verify that, for the confusion matrix shown in Table 5, the cost-based score would be 4,228.

The possible ‘perfect’ score can be attained by constructing a confusion matrix that shows observed vs 100% correctly predicted outcomes. That is, the row totals will be entered in the cells on the diagonal, and all other values will be zero. For the example case shown in Table 5, this would yield a score of 6,340. To scale the custom cost-based score to a similar range as the accuracy metrics shown in Table 4, the cost-based score was expressed as a percentage of the possible perfect score. Thus, for the example in Table 5, this would be 4,228 divided by 6,340, that is 0.67, or 67%

## Resampling approach for model evaluation

As stated in the discussion of the under-sampling methodology outlined earlier, for the majority class with ‘no treatment’ assigned, a random sample was taken from the overall dataset to represent the majority class in a more balanced way. Therefore, the model training and accuracy metrics will depend to some extent on the random sample taken, as well as on the randomised stratified shuffle split used to generate the training and testing sets.

To account for this randomness, and to obtain a true indication of model performance, the process of random under-sampling, stratified splitting, model training and model evaluation was repeated three times for each of the models that were evaluated. This approach is known as bootstrap sampling since the samples are taken with replacement in each case (Kuhn & Johnson, 2013).

Other approaches such as k-fold cross validation can also be used. However, given the sequence of random under-sampling followed by stratified random splitting, it was decided to perform a simple bootstrap sampling. This approach was partly adopted for convenience of calculation, and partly because of the comments by Kuhn and Johnson (2013) suggesting that, when the objective is to choose between models, bootstrap sampling is a good approach to follow (it should also be noted that the aforementioned authors also stated that no resampling method is uniformly better than another).

## Model selection

The selection of a classification model is complex owing to the many options and parameters that can potentially be considered. Some of these parameters include:

• Model type;

• Method (if any) for transforming/scaling predictor variables;

• Model tuning parameters (varies depending on model type); and

• Number of predictor variables considered.

To comprehensively evaluate all of the different options is likely to be overly complex and counterproductive. For example, the optimal parameters for a model will be dependent on the method of scaling predictors, and this may again vary depending on the number of predictor variables considered. For this study, it was decided to do a staged model selection.

## Initial model evaluation

In the first stage, 13 models were considered. Some of these were variants of the same model. For example, for the K-Nearest Neighbour model, two variants were trialled, being a 1-Nearest Neighbour (coded ‘1-KNN’) and 3 Nearest Neighbour (coded ‘3-KNN’).

Machine learning models tend to perform better when the predictor variables have a similar scale (Geron, 2017; Kuhn & Johnson, 2013). Some models also perform better when variables approximate a Gaussian distribution. For the initial model assessment, two methods for transforming predictor variables were tested in addition to doing no variable transformation. These two transformation methods were: (a) Min–Max transformation (also called Normalisation); and (b) Standardisation (Geron, 2017; Kuhn & Johnson, 2013).

Table 7. Model performance (No transformation of predictor variables).

|  | C | ustom Co | st-Based | Score |  |  | F1 Score |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Scikit-Learn Classification Model | S-1 | S-2 | S-3 | Average | S-1 | S-2 | S-3 | Average |
| Histogram-GradientBoosting | 0.62 | 0.66 | 0.68 | 0.65 | 0.74 | 0.78 | 0.79 | 0.77 |
| GradientBoosting | 0.66 | 0.63 | 0.66 | 0.65 | 0.77 | 0.75 | 0.77 | 0.76 |
| ExtraTrees | 0.59 | 0.57 | 0.56 | 0.57 | 0.72 | 0.72 | 0.71 | 0.72 |
| Random Forest | 0.55 | 0.53 | 0.54 | 0.54 | 0.71 | 0.7 | 0.7 | 0.70 |
| Decision Tree with Bagging | 0.52 | 0.53 | 0.53 | 0.53 | 0.7 | 0.69 | 0.7 | 0.70 |
| Decision Tree | 0.51 | 0.48 | 0.51 | 0.50 | 0.66 | 0.65 | 0.66 | 0.66 |
| ADABoost Learning Rate 0.7 | 0.53 | 0.48 | 0.49 | 0.50 | 0.7 | 0.66 | 0.67 | 0.68 |
| ADABoost Learning Rate 0.3 | 0.52 | 0.48 | 0.48 | 0.49 | 0.7 | 0.67 | 0.66 | 0.68 |
| Naive Bayes | 0.48 | 0.5 | 0.48 | 0.49 | 0.64 | 0.65 | 0.62 | 0.64 |
| Neural Network | 0.37 | 0.44 | 0.46 | 0.42 | 0.58 | 0.51 | 0.59 | 0.56 |
| 1-KNN Model | 0.4 | 0.38 | 0.34 | 0.37 | 0.61 | 0.58 | 0.55 | 0.58 |
| 3-KNN Model | 0.36 | 0.33 | 0.35 | 0.35 | 0.59 | 0.56 | 0.57 | 0.57 |
| SGD Classifier | 0.16 | 0.34 | 0.23 | 0.24 | 0.51 | 0.41 | 0.31 | 0.41 |

Table 8. Model performance (Min-Max transformation of predictor variables).

|  | C | ustom Co | st-Based | Score |  |  | F1 Score |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Scikit-Learn Classification Model | S-1 | S-2 | S-3 | Average | S-1 | S-2 | S-3 | Average |
| Histogram-GradientBoosting | 0.56 | 0.58 | 0.55 | 0.56 | 0.71 | 0.71 | 0.68 | 0.70 |
| Neural Network | 0.54 | 0.51 | 0.52 | 0.52 | 0.69 | 0.65 | 0.69 | 0.68 |
| SGD Classifier | 0.46 | 0.49 | 0.54 | 0.50 | 0.54 | 0.65 | 0.7 | 0.63 |
| Random Forest | 0.57 | 0.48 | 0.42 | 0.49 | 0.65 | 0.65 | 0.67 | 0.66 |
| ExtraTrees | 0.57 | 0.48 | 0.42 | 0.49 | 0.66 | 0.65 | 0.67 | 0.66 |
| GradientBoosting | 0.44 | 0.51 | 0.5 | 0.48 | 0.58 | 0.69 | 0.69 | 0.65 |
| Decision Tree with Bagging | 0.3 | 0.37 | 0.38 | 0.35 | 0.47 | 0.54 | 0.6 | 0.54 |
| 1-KNN Model | 0.33 | 0.32 | 0.3 | 0.32 | 0.54 | 0.53 | 0.56 | 0.54 |
| 3-KNN Model | 0.33 | 0.32 | 0.28 | 0.31 | 0.55 | 0.55 | 0.57 | 0.56 |
| ADABoost Learning Rate 0.3 | 0.23 | 0.28 | 0.37 | 0.29 | 0.47 | 0.53 | 0.6 | 0.53 |
| ADABoost Learning Rate 0.7 | 0.23 | 0.26 | 0.37 | 0.29 | 0.47 | 0.44 | 0.61 | 0.51 |
| Decision Tree | 0.25 | 0.26 | 0.32 | 0.28 | 0.35 | 0.44 | 0.49 | 0.43 |
| Naive Bayes | 0.2 | 0.1 | 0.44 | 0.25 | 0.23 | 0.11 | 0.59 | 0.31 |

Tables 7–9 summarise the performance of the 13 models trialled in the initial model selection. The results shown are the metrics based on the performance of the model on the test set that is, in each of three resamplings, set aside before training of the model (results of each resampling are shown in columns S-1, S-2 and S-3). The results in these tables are ranked from best to worst based on the custom cost-based score presented earlier. Description of the models shown in these tables is beyond the scope of this paper, but detailed descriptions of the models with references to underlying research can be found on the Scikit-Learn website (Pedregosa et al., 2011). Tables 7–9 prompt the following observations:

• In general, the ranking of models based on custom based scores is similar to the ranking based on the F1 score.

• The outcomes for no variable transformation and standardised transformation are similar and significantly better than the outcomes for the case where the Min–Max variable transformation is used.

Based on the results shown in Tables 7–9, it was decided to select the ‘ExtraTrees’, ‘GradientBoosting’ and ‘Histogram GradientBoosting’ models for further evaluation.

Table 9. Model performance (Standardised transformation of predictors).

|  | C | ustom Co | st-Based | Score |  |  | F1 Score |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Scikit-Learn Classification Model | S-1 | S-2 | S-3 | Average | S-1 | S-2 | S-3 | Average |
| GradientBoosting | 0.64 | 0.57 | 0.63 | 0.61 | 0.77 | 0.72 | 0.75 | 0.75 |
| Histogram-GradientBoosting | 0.6 | 0.63 | 0.6 | 0.61 | 0.74 | 0.74 | 0.74 | 0.74 |
| ExtraTrees | 0.6 | 0.57 | 0.64 | 0.60 | 0.74 | 0.71 | 0.76 | 0.74 |
| Decision Tree with Bagging | 0.57 | 0.54 | 0.59 | 0.57 | 0.74 | 0.71 | 0.74 | 0.73 |
| Random Forest | 0.57 | 0.54 | 0.59 | 0.57 | 0.74 | 0.7 | 0.74 | 0.73 |
| Neural Network | 0.55 | 0.52 | 0.54 | 0.54 | 0.71 | 0.68 | 0.7 | 0.70 |
| ADABoost Learning Rate 0.3 | 0.5 | 0.54 | 0.52 | 0.52 | 0.69 | 0.71 | 0.69 | 0.70 |
| ADABoost Learning Rate 0.7 | 0.5 | 0.46 | 0.56 | 0.51 | 0.69 | 0.67 | 0.71 | 0.69 |
| Decision Tree | 0.48 | 0.51 | 0.49 | 0.49 | 0.66 | 0.67 | 0.65 | 0.66 |
| Naive Bayes | 0.48 | 0.48 | 0.5 | 0.49 | 0.62 | 0.64 | 0.63 | 0.63 |
| SGD Classifier | 0.48 | 0.5 | 0.45 | 0.48 | 0.67 | 0.65 | 0.63 | 0.65 |
| 1-KNN Model | 0.47 | 0.37 | 0.43 | 0.42 | 0.65 | 0.6 | 0.63 | 0.63 |
| 3-KNN Model | 0.42 | 0.41 | 0.42 | 0.42 | 0.64 | 0.63 | 0.64 | 0.64 |

## Refinement of selected features

In the initial model selection, all of the available predictor variables (referred to as model features) were included in the model. It is, however, preferable to reduce the number of features included in the model. This simplifies implementation of the model but also reduces the potential that the model may be over-fitted to the data which increases the chance that the model performance will degrade with the introduction of more data (Kuhn & Johnson, 2013).

For this reason, the number of features were reduced and the model accuracy was then reevaluated. The starting point for this analysis was to obtain the variable importance graph using the Scikit-Learn’s capability to rank feature importance.

Figure 2 shows the relative importance of features for the GradientBoosting classifier model. It can be seen from this graph that most of the features involving the coefficient of determination $( \mathsf { R } ^ { 2 } )$ (from the regression used for deterioration rate calculation) were not highly important. It was therefore decided to remove all features based on the $\mathsf { R } ^ { 2 }$ values $( \mathsf { R } ^ { 2 }$ values, as a measure of the strength of the relationships, were initially included because it was thought they may provide an indirect indication of the consistency of deterioration rate over time).

Furthermore, it was decided to remove features that (a) were of low importance; and/or (b) may be difficult to consistently or reliably determine in any eventual operational implementation of the model. For example, Urban/Rural (code: ‘urb\_rural\_Code’) was removed due to low importance, and surfacing first chip size and surface thickness (‘surfSize1’ and ‘surfThick’) were removed due to lower levels of confidence in the data. It may seem strange to remove the surfacing first chip size and surface thickness, since they are amongst the most important variables according to Figure 2. However, it was suspected that the classification model was using these variables mainly as surrogates for surface type classification, and that the surface type class (code ‘surf\_code’) would serve as well in a reduced model. This suspicion was proven to be accurate, as will be shown in the discussion of the finalised models with reduced features.

The relatively high importance of surface age (coded ‘surfAge’) and skid resistance, as quantified by the percentage of the segment with skid resistance below the Investigatory Limit (coded ‘BelowIL\_perc’), is probably due to the role these variables play in Chipseal assignment. It can also be noted from Figure 2 that statistics related to Texture depth and roughness (NAASRA counts/km), are relatively important, with rut statistics/measures being of relatively lesser importance. This is possibly due to the small number of Rehabilitation projects in the data set, in which rut depth is likely to play a role in treatment selection.

![](images/page_12_chart_3.jpg)

Figure 2. Relative feature importance (based on Gradient Boosting Classifier).

## Final model

Tables 10 and 11 show the performance metrics of the selected models without and with standardised transformation of feature variables, respectively. In this case, with a reduced number of features, the models where no transformation of variables was applied (Table 10) perform slightly better than the models where standardised transformation was applied (Table 11).

Table 10. Model performance (Reduced features, No transformations).

<table><tr><td></td><td colspan="4">Custom Cost-Based Score</td><td colspan="4">F1 Score</td></tr><tr><td>Scikit-Learn Classification Model</td><td>S-1</td><td>S-2</td><td>S-3</td><td>Average</td><td>S-1</td><td>S-2</td><td>S-3</td><td>Average</td></tr><tr><td>GradientBoosting</td><td>0.66</td><td>0.65</td><td>0.67</td><td>0.66</td><td>0.78</td><td>0.78</td><td>0.78</td><td>0.78</td></tr><tr><td>Histogram-GradientBoosting</td><td>0.62</td><td>0.65</td><td>0.66</td><td>0.64</td><td>0.76</td><td>0.77</td><td>0.77</td><td>0.77</td></tr><tr><td>ExtraTrees</td><td>0.66</td><td>0.62</td><td>0.63</td><td>0.64</td><td>0.78</td><td>0.75</td><td>0.74</td><td>0.76</td></tr></table>

Table 11. Model performance (Reduced features, Standardised transformations).

<table><tr><td></td><td colspan="4">Custom Cost-Based Score</td><td colspan="4">F1 Score</td></tr><tr><td>Scikit-Learn Classification Model</td><td>S-1</td><td>S-2</td><td>S-3</td><td>Average</td><td>S-1</td><td>S-2</td><td>S-3</td><td>Average</td></tr><tr><td>GradientBoosting</td><td>0.64</td><td>0.66</td><td>0.64</td><td>0.65</td><td>0.76</td><td>0.77</td><td>0.77</td><td>0.77</td></tr><tr><td>Histogram-GradientBoosting</td><td>0.66</td><td>0.65</td><td>0.62</td><td>0.64</td><td>0.77</td><td>0.76</td><td>0.75</td><td>0.76</td></tr><tr><td>ExtraTrees</td><td>0.62</td><td>0.66</td><td>0.61</td><td>0.63</td><td>0.74</td><td>0.77</td><td>0.75</td><td>0.75</td></tr></table>

Table 12. Final Model performance on holdout test set.

<table><tr><td rowspan=2 colspan=2>Average of 3 Samples</td><td colspan=4>Predicted</td><td></td></tr><tr><td>None</td><td>Chipseal</td><td>Asphalt</td><td>Rehab</td><td>Obs. Totals</td></tr><tr><td rowspan=4>Obbssrved</td><td>None</td><td>261.3</td><td>46.0</td><td>9.7</td><td>0.0</td><td>317.0</td></tr><tr><td>Chipseal</td><td>54.3</td><td>179.3</td><td>3.7</td><td>2.7</td><td>240.0</td></tr><tr><td>Asphalt</td><td>6.3</td><td>1.0</td><td>46.7</td><td>0.0</td><td>54.0</td></tr><tr><td>Rehab</td><td>3.7</td><td>8.7</td><td>5.3</td><td>5.3</td><td>23.0</td></tr><tr><td colspan=2>Predicted Totals</td><td>325.7</td><td>235.0</td><td>65.3</td><td>8.0</td><td></td></tr></table>

Table 13. Engineering assessment of final model performance.

| Performance Indicator | Observed | Predicted | Accuracy |
| --- | --- | --- | --- |
| Segments with No Treatment, observed vs predicted | 317.0 | 261.3 | 82% |
| Segments with Treatment Assigned, observed vs predicted | 317.0 | 252.7 | 80% |
| Segments with Chipseal, observed vs predicted | 240 | 179.3 | 75% |
| Segments with Asphalt Overlays, observed vs predicted | 54 | 46.7 | 86% |
| Segments with Rehabilitation, observed vs predicted | 23 | 5.3 | 23% |

Compared to Tables 7 and 9, it is seen that the simplified models perform slightly better than the models where all features are included. Thus, there is no disadvantage, and possibly a slight advantage, in using the simplified models with a reduced number of features (39 features compared to 57 when all features are included).

The three selected models perform very similar. Based on the data in Tables 10 and 11, it was finally decided to select the Gradient Boosting model with no transformation of features. It can be seen that, comparing the Gradient Boosting model with reduced features (Table 10) with the same model in which all features are used (Table 7), that these two models show nearly identical performance on the Custom-and-F1 scores.

The performance of the final model is summarised in Table 12 which shows the confusion matrix representing the average counts achieved on the holdout test set from three bootstrap samples. Table 13 shows an engineering interpretation of the model performance based on the data in Table 12.

The data in Tables 12 and 13 show that the finalised model performs well on the holdout test set. In terms of predicting whether a segment was treated or untreated, the model is reasonably accurate. On average, the model predicted some type of treatment on 55.7 segments where in fact no treatment was observed. Using the total number of observed ‘no treatment’ cases (317) as a base, this amounts to a false positive rate of approximately 17.6% as far as overall treatment is concerned. The model also predicted no treatment on 64.3 segments where in fact some form of treatment was observed. Using the total number of cases where some treatment was observed (i.e. 317) this amounts to a false negative rate of approximately 20%.

The percentage of true positives for Chipseals and Asphalt overlays are 75% and 86% respectively. This is regarded as an exceptionally good outcome, especially if the tool is to be used for screening purposes. The model performance to specifically identify rehabilitation sites is less impressive, with on average only 5 out of 23 rehabilitations correctly predicted. Clearly the very small percentage of observed rehabilitations (0.4% of the overall data set) is a challenge for training the model. This is clearly an area that needs more work and could be addressed through an expanded set or possibly more sophisticated under-sampling or over-sampling techniques.

Figure 3 shows the relative importance of features in the Gradient Boosting model with reduced features. This information is important to road agencies who might want to apply a machine learning approach to the prediction of pavement treatment types. The categories of data that appear to be most important to the model, and would therefore be important to focus on for road agencies, are:

Type and Age of surfacing: these predictors are likely to impact on the overall surfacing condition and are probably inherent indicators of skid resistance, texture and maintenance requirements;

Percentage of skid resistance below Investigatory Limit and Texture Depth: This is as expected, since these parameters are a key driver in selection of sites for application of chip seal and asphalt to address safety concerns;

• Number of routine maintenance interventions over the past year and Routine maintenance cost over the past year: Both of these play a role in the prioritisation of treatments on the network under a budget constraint. Treating sites with higher routine maintenance cost is a rational decision from a life cycle analysis perspective;

• Traffic indicators (ESA per day and AADT): As expected, the intensity of traffic plays a role in determining the rate of deterioration, specifically with respect to rut and roughness development; and

• Roughness: Plays a role in identifying sites that required smoothening and is rational from a vehicle operating cost minimisation perspective, as well as potential safety issues.

Although the above categories of data were deemed to be the most important when the model was trained using New Zealand road network data, they do all make engineering sense. Consequently, they will almost certainly prove to be among the most important on other road networks for predicting reseal and asphalt overlays. The paucity of observed rehabilitations in the dataset has resulted in structural performance measures, such as rutting and cracking, being noticeable by their absence.

## Conclusions

The challenge in pavement management is to ensure that the correct treatment is applied to each segment of road at the appropriate time. Pavement management systems help develop forward works programmes, however, pavement engineers will further investigate and, ultimately, decide on the appropriate treatment based on the information available, using their professional judgement and experience. While it is understandable that the treatment type predicted by the pavement management system and that ultimately decided by the pavement engineer might differ to some extent, large disparities between the two are coming under increased scrutiny. Alignment between the FWP and actual renewals undertaken are now being written into management contracts in order to test the stability of the contractors predictions.

In order to assist with this challenge, this research developed a model for the prediction of pavement treatment types using multi-classification machine learning algorithms. The algorithm was trained using data from four of the Network Outcome Contracts (NOC) networks in New Zealand and then validated using a holdout test set. Multiple machine learning algorithms were evaluated within the Python-based Scikit-Learn framework, with the final selected model utilising the Gradient Boosting algorithm.

![](images/page_15_chart_3.jpg)

Figure 3. Relative feature importance (reduced feature set, Gradient Boosting Classifier).

The model attemps to predict whether a segment received treatment in the holdout test set and what particular treatment type (reseal, overlay or rehabilitation) was undertaken. In terms of predicting whether a segment received treatment, the model was 80% accurate. A similar accuracy of just over 82% was reported for the ability of the model to predict which segments did not receive treatment. The prediction of specific treatment types returned an accuracy of 75% for reseals and 86% for overlays. The model was, however, limited in terms of its prediction of rehabilitation due to a lack of data in the training set, returning an accuracy of 23%. However, given the above reported accuracies, it can be concluded that the potential of machine learning to assist in this challenge is highly promising.

The categories of data that appear to be most influential in the prediction, and would therefore be important to focus on for road agencies, were type and age of surfacing, percentage of skid resistance below Investigatory Limit, routine maintenance cost and number of interventions over the past year, traffic loading and volume, texture depth, and roughness. The paucity of observed rehabilitations in the dataset has resulted in structural performance measures, such as rutting and cracking, being noticeable by their absence.

Further research will be undertaken to continue to improve the model and to overcome some of the limitations reported.

## Acknowledgements

The authors would like to acknowledge Fulton Hogan contractors for making the data available for use in this research and Lonrix Ltd for the use of their asset management system, JunoViewer, where the data was stored.

## Disclosure statement

No potential conflict of interest was reported by the author(s).

## ORCID

Seosamh B. Costello [http://orcid.org/0000-0002-8394-5442](http://orcid.org/0000-0002-8394-5442)

## References

Barua, L., Zou, B., Noruzoliaee, M., & Derrible, S. (2021). A gradient boosting approach to understanding airport runway and taxiway pavement deterioration. International Journal of Pavement Engineering, 22(13), 1673–1687. [https://doi.org/10.1080/10298436.2020.1714616.](https://doi.org/10.1080/10298436.2020.1714616)

Ceylan, H., Bayrak, M. B., & Gopalakrishnan, K. (2014). Neural networks applications in pavement engineering: A recent survey. International Journal of Pavement Research and Technology, 7(6), 434–444. [https://doi.org/10.6135/ijprt.org.tw/2014.7(6).434](https://doi.org/10.6135/ijprt.org.tw/2014.7%286%29.434)

Costello, S., & Snaith, M. (2015). Pavement asset management. In C. O’Flaherty, & D. Hughes (Eds.), Highways: The location, design, construction and maintenance of road pavements (pp. 469–490). ICE Publishing. [https://doi.org/10.1680/h5e.59931.469.](https://doi.org/10.1680/h5e.59931.469)

Geron, A. (2017). Hands-on machine learning with Scikit-Learn & TensorFlow. (concepts, tools, and techniques to build intelligent systems). O’Reilly Media.

Gong, H., Sun, Y., Mei, Z., & Huang, B. (2018a). Improving accuracy of rutting prediction for mechanisticempirical pavement design guide with deep neural networks. Construction and Building Materials, 190, 710–718. [https://doi.org/10.1016/j.conbuildmat.2018.09.087](https://doi.org/10.1016/j.conbuildmat.2018.09.087)

Gong, H., Sun, Y., Shu, X., & Huang, B. (2018b). Use of random forests regression for predicting IRI of asphalt pavements. Construction and Building Materials, 189(2018), 890–897. [https://doi.org/10.1016/j.conbuildmat.2018.09.017](https://doi.org/10.1016/j.conbuildmat.2018.09.017)

Hafez, M., Ksaibati, K., & Atadero, R. A. (2019). Optimizing expert-based decision-making of pavement maintenance using Artificial Neural networks with pattern-recognition algorithms. Transportation Research Record 2019, 2673(11), 90–100. [https://doi.org/10.1177/0361198119851085](https://doi.org/10.1177/0361198119851085)

Inkoom, S., Sobanjo, J., Barbu, A., & Niu, X. (2019a). Prediction of the crack condition of highway pavements using machine learning models. Struct. Infrastruct. Eng, 15(7), 1–14. [https://doi.org/10.1080/15732479.2019.1581230](https://doi.org/10.1080/15732479.2019.1581230)

Inkoom, S., Sobanjo, J., Barbu, A., & Niu, X. (2019b). Pavement crack rating using machine learning frameworks: Partitioning, bootstrap forest, boosted trees, naïve Bayes, and K-nearest neighbors. J. Transp. Eng. B-Pave, 145(3), 04019031. [https://doi.org/10.1061/JPEODX.0000126](https://doi.org/10.1061/JPEODX.0000126)

Kubat, M. (2015). An introduction to machine learning. Second edition. Springer International Publishing AG, Springer Nature.

Kuhn, M., & Johnson, K. (2013). Applied predictive modelling. Springer.

Lemaitre, G., Nogueira, F., & Aridas, C. K. (2017). Imbalanced-learn: A Python toolbox to tackle the curse of imbalanced datasets in machine learning. Journal of Machine Learning Research, 18(17), 1–5.

Lonrix. (2020). The JunoViewer Asset Management Framework. Lonrix Limited NZ web site. URL: [http://www.lonrix.com/](http://www.lonrix.com/)[Accessed 4 March 2020].

Majidifard, H., Adu-Gyamfi, Y., & Buttlar, W. G. (2020). Deep machine learning approach to develop a new asphalt pavement condition index. Construction and Building Materials, 247(2020), 118513. [https://doi.org/10.1016/j.conbuildmat.2020.118513](https://doi.org/10.1016/j.conbuildmat.2020.118513)

Mandal, V., Uong, L., & Adu-Gyamfi, Y. (2018). Automated road crack detection using Deep convolutional Neural networks. 2018 IEEE International Conference on Big Data (Big Data), 2018, 5212–5215. [https://doi.org/10.1109/BigData.2018.862-2327](https://doi.org/10.1109/BigData.2018.862-2327)

Marcelino, P., de Lurdes Antunes, M., Fortunato, E., & Gomes, M. C. (2017). Machine learning for pavement friction prediction using scikit-learn. In E. Oliveira, J. Gama, Z. Vale, & H. Lopes Cardoso (Eds.), Progress in Artificial intelligence. EPIA 2017. Lecture notes in computer science, vol 10423 (pp. 331–342). Springer. [https://doi.org/10.1007/978-3-319-65340-2\_28.](https://doi.org/10.1007/978-3-319-65340-2_28)

Marcelino, P., de Lurdes Antunes, M., Fortunato, E., & Gomes, M. C. (2019). Machine learning approach for pavement performance prediction. International Journal of Pavement Engineering, [https://doi.org/10.1080/10298436.2019.1609673](https://doi.org/10.1080/10298436.2019.1609673)Morales, F. J., Reyes, A., Caceres, N., Romero, L. M., Benitez, F. G., Morgado, J., & Duarte, E. (2020). A machine learning methodology to predict alerts and maintenance interventions in roads. Road Materials and Pavement Design, 2267–2288. [https://doi.org/10.1080/14680629.2020.1753098.](https://doi.org/10.1080/14680629.2020.1753098)

NZTA. (2020). State Highway maintenance contract proforma manual. Appendix A7: Network Outcomes Contract – Maintenance Specification. Available from: [https://www.nzta.govt.nz/resources/state-highway-maintenance-contract-proforma-manual/maintenance-contract-proforma.html](https://www.nzta.govt.nz/resources/state-highway-maintenance-contract-proforma-manual/maintenance-contract-proforma.html) [accessed 22 Dec 2019].

Parkman, C., Hallet, J., Henning, T., & Tapper, M. (2003). Pavement deterioration modelling in long term performance based contracts: How Far does It mitigate The risk For client and contractor? Proceedings: Conference of the Australian Road Research Board, 21, 1565–1579.

Pedregosa, F., Varoquaux, G., Gramfort, A., Michel, V., Thirion, B., Grisel, O., Blondel, M., Prettenhofer, P., Weiss, R., Dubourg, V., Vanderplas, J., Passos, A., Cournapeau, D., Brucher, M., Perrot, M., & Duchesnay, É. (2011). Scikit-learn: Machine learning in python. J. Mach. Learn. Res, 12, 2825–2830.

R Development Core Team. (2010). R: A language and Environment for Statistical Computing. Computer programme. http://www.R-project.org/

van Buuren, S., & Groothuis-Oudshoorn, K. (2011). Mice: Multivariate imputation by chained equations in R. Journal of Statistical Software, 45(3), 1–67. [https://doi.org/10.18637/jss.v045.i03](https://doi.org/10.18637/jss.v045.i03)

Yao, L., Dong, Q., Jiang, J., & Ni, F. (2020). Deep reinforcement learning for long-term pavement maintenance planning. Comput Aided Civ Inf. 2020, 35(11), 1230–1245. [https://doi.org/10.1111/mice.12558](https://doi.org/10.1111/mice.12558)

Ziari, H., Sobhani, J., Ayoubinejad, J., & Hartmann, T. (2016). Prediction of IRI in short and long terms for flexible pavements: ANN and GMDH methods. International Journal of Pavement Engineering, 17(9), 776–788. [https://doi.org/10.1080/10298436.2015.1019498](https://doi.org/10.1080/10298436.2015.1019498)