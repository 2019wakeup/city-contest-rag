<!--
SOURCE: 原始 PDF: City_Contest/ref/106 Machine Learning-Driven Prediction and Design Guidance for Asphalt Concrete Usin.pdf | 页数: 29 | 集合: city_contest_ref
题录: litfull-nolit-106-machine-learning-driven-prediction-and-design- Machine Learning-Driven Prediction and Design Guidance for Asphalt Concrete Using Marshall (DOI: 10.1016/j.jclepro.2021.126659))
提取: MinerU markdown 全文（可重建索引的真相源副本；images/ 不入 corpus）
-->
Article

# Machine Learning-Driven Prediction and Design Guidance for Asphalt Concrete Using Marshall Stability and Indirect Tensile Strength

**Jianglei Xing** <strong><sup>1</sup></strong>**, Xiao Tan** <strong><sup>1,2</sup></strong>**,\* , Mu Guo** <strong><sup>3</sup></strong>**, Pengwei Guo** <strong><sup>4</sup></strong>**, Yuhuan Wang** <strong><sup>5</sup></strong> **and Dongzhao Jin** <strong><sup>6</sup></strong>**,**\*

College of Water Conservancy and Hydropower Engineering, Hohai University, Nanjing 210024, China; 241602010139@hhu.edu.cn

2 State Key Laboratory of Water Disaster Prevention, Nanjing 210024, China

3 Shanghai Research Institute of Building Science Co., Ltd., Shanghai 201108, China; guomu@sribs.com.cn

4 Bartlett School of Sustainable Construction, University College London, London WC1E 6BT, UK; pengwei.guo@ucl.ac.uk

5 Department of Civil, Environmental, and Architectural Engineering, University of Colorado Boulder, Boulder, CO 80309, USA

6 Department of Civil, Environmental, and Geospatial Engineering, Michigan Technological University, Houghton, MI 49931, USA

\* Correspondence: xiaotan@hhu.edu.cn (X.T.); dongj@mtu.edu (D.J.)

## Abstract

This work addresses the simultaneous prediction of Marshall Stability (MS) and Indirect Tensile Strength (ITS) by integrating machine learning models with multi-objective optimization for the preliminary design of asphalt concrete. Based on 389 experimental samples, 15 variables were selected to describe asphalt properties, aggregate gradation, volumetric parameters and fiber characteristics, and four dual-output prediction models were developed. The models were evaluated using 50 Monte Carlo splits. TabICLv2 performed slightly better for MS prediction, with an RMSE of $1 . 4 9 \pm 0 . 2 2$ kN and an R2 of $0 . 8 5 \pm 0 . 0 4 ,$ whereas TabPFN showed a slight advantage for ITS prediction, achieving an RMSE of $0 . 2 3 \pm 0 . 0 8$ MPa and an R<sup>2</sup> of $0 . 9 1 \pm 0 . 0 6$ . Furthermore, Pareto filtering identified nine non-dominated mixtures, and TOPSIS ranking selected the highest-ranked equal-weight compromise mixture, with MS = 15.23 kN and ITS = 3.90 MPa. The results indicate that mineral fibers are more suitable for improving the balanced performance of MS and ITS, carbon fibers are more favorable for improving MS, and plastic fibers are more effective in improving ITS. Finally, a Streamlit-based graphical user interface was developed to enable real-time prediction and MS–ITS trade-off visualization, providing a reference for preliminary mix design of asphalt concrete.

## Check for updates

Academic Editor: Danuta Barnat-Hunek

Received: 30 June 2026 Revised: 27 July 2026 Accepted: 4 August 2026 Published: 11 August 2026

**Copyright:** © 2026 by the authors. Licensee MDPI, Basel, Switzerland. This article is an open access article distributed under the terms and conditions of the [Creative Commons Attribution (CC BY) license.](https://creativecommons.org/licenses/by/4.0/)

**Keywords:** asphalt concrete; Marshall stability; indirect tensile strength; machine learning; Pareto filtering; TOPSIS ranking

## 1. Introduction

Asphalt concrete serves as a fundamental material in a wide range of civil infrastructure applications, particularly in highway pavements [1], airport surfaces [2], parking facilities [3], and impermeable core structures in embankment dams [4]. Its popularity stems from a combination of favorable engineering characteristics, such as adequate strength, water resistance, and economic efficiency throughout its service life [5–7]. However, the performance of asphalt concrete gradually changes when exposed to repeated loading, temperature fluctuations, oxidative aging, and other environmental influences [8–10]. These interacting factors can progressively deteriorate the mechanical performance of asphalt concrete and reduce the long-term reliability of engineering structures. Consequently, developing effective approaches for assessing and forecasting the mechanical behavior of asphalt concrete has become an essential task for material design, quality control, and infrastructure management.

Among the commonly used mechanical performance indicators, Marshall Stability (MS) and Indirect Tensile Strength (ITS) are two important parameters for evaluating asphalt concrete. MS is generally used to characterize the stability and deformation resistance of asphalt mixtures under loading [11], while ITS reflects the tensile resistance and cracking-related performance [12]. The two indicators describe different aspects of mechanical behavior and are not always improved simultaneously. A mixture with high MS may not necessarily exhibit excellent tensile resistance, and a mixture with high ITS may not always have the best stability or deformation resistance. Therefore, focusing only on a single performance indicator may lead to incomplete or biased mixture evaluation. Simultaneous consideration of MS and ITS is more suitable for assessing the balanced mechanical performance of asphalt concrete and supporting multi-objective mixture selection.

Traditional experimental methods provide direct and reliable measurements of asphalt mixture performance, but they are usually time-consuming, labor-intensive, and costly [13–18]. Changes in asphalt properties, aggregate gradation, volumetric parameters, fiber characteristics, and production-related conditions often require repeated laboratory tests to evaluate their effects on MS and ITS. In addition, the mechanical behavior of asphalt concrete is governed by complex nonlinear interactions among multiple variables, such as asphalt content, air voids, gradation structure, and fiber content. Empirical equations and simple statistical methods are usually limited by predefined assumptions and specific data ranges, making it difficult to accurately capture these interactive effects [19,20]. More over, traditional experimental or empirical approaches provide limited support for rapidly identifying mixtures with balanced MS and ITS performance from existing experimental data [21,22].

Machine learning provides a promising alternative for modeling the nonlinear relationship between mixture design variables and mechanical properties. In recent years, data-driven methods have been increasingly applied to predicting the properties of concrete materials, including compressive strength, tensile strength, elastic modulus, durability related indicators, and other engineering performance parameters [23–25]. Traditional machine learning models, such as Extreme Gradient Boosting (XGBoost) and Random Forest (RF), have also been widely employed in asphalt concrete research to predict key performance indicators such as Marshall stability, splitting strength, rutting resistance, and stiffness modulus [26,27].

Although previous studies have achieved encouraging results using machine learning techniques, the majority of adopted models are still based on conventional algorithms, such as neural-network models, bagging ensembles, and boosting ensembles. Their performance heavily depends on large dataset-specific training procedures and extensive hyperparameter tuning to achieve satisfactory predictive capability [28,29]. Recently, tabular foundation models, represented by Tabular Prior-data Fitted Network (TabPFN) and Tabular In-Context Learning version 2 (TabICLv2), have emerged as a new generation of machine learning methods for tabular data, showing promising potential in handling small-size, heterogeneous, and high-dimensional datasets with reduced tuning requirements [30,31]. In addition, existing studies have predominantly focused on predicting or optimizing a single performance indicator, whereas investigations that simultaneously consider multiple balanced mechanical properties, such as MS and ITS, are still limited.

To address the above issues, this study develops a machine-learning framework for the synthetic prediction of Marshall stability (MS) and indirect tensile strength (ITS) for the data-driven mixture selection. Specifically, three main innovations are as follows: (1) a heterogeneous database comprising 389 experimental asphalt mixtures and 15 features is established for the simultaneous prediction of MS and ITS, supporting the integrated assessment of deformation resistance and tensile resistance; (2) two tabular foundation models, TabPFN and TabICLv2, are systematically benchmarked against Optuna-tuned Random Forest and XGBoost models using 50 repeated Monte Carlo via 80/20 train-test splits, with target-specific prediction accuracy and stability reported separately for MS and ITS; and (3) an experimental data-driven mixture selection strategy combining Pareto filtering and TOPSIS ranking is implemented in the MS-ITS objective space to identify experimentally validated mixtures with balanced mechanical performance. The resulting prediction and trade-off analyses are further deployed in a Streamlit-based graphical user interface (GUI) for real-time prediction, visualization, and local interpretation.

## 2. Materials and Methods

Figure 1 presents the general research framework of this study, which consists of four main stages: (1) An asphalt concrete database was constructed and preprocessed. The database contains 389 experimental samples, with 15 input variables describing asphalt properties, aggregate gradation, volumetric parameters, and fiber characteristics. MS and ITS were regarded as two output targets. (2) Dual-output machine learning models were developed to predict MS and ITS simultaneously. Two tabular models, TabICLv2 and TabPFN, were compared with two traditional tree-based ensemble models, RF and XGBoost. For RF and XGBoost, Optuna was further used for hyperparameter tuning. (3) Model performance was evaluated through Monte Carlo cross-validation using multiple indicators, including RMSE, MAE, MAPE, MAD, and R<sup>2</sup>. These metrics were further integrated into a composite score to support unified model comparison and ranking. (4) The experimentally observed mixtures were screened using Pareto filtering in the MS– ITS objective space, and the retained Pareto samples were ranked by TOPSIS. The selected models and trade-off analysis results were then integrated into a Streamlit-based GUI to support performance prediction, visualization, and preliminary mixture selection.

![](images/page_2_image_6.jpg)

Figure 1. General research framework.

## 2.1. Dataset Preparation and Preprocessing

## 2.1.1. Data Collection and Variable Description

A dataset of 389 asphalt concrete mixtures was collected from 42 published studies covering the period 2003–2024, providing the basis for synthetic modeling MS and ITS [32–73]. To represent the main mixture design factors, 15 input variables were selected and grouped according to asphalt binder properties, aggregate gradation, volumetric indices, and fiber characteristics [26]. The asphalt-related features included penetration (Pe), ductility (Du), softening point (SP), and asphalt content (AC). The aggregate- and volumetric-related features included the sieve passing percentages of 2.36 mm, 4.75 mm, and 9.5 mm aggregates (Ag2.36, Ag4.75, and Ag9.5); air voids (AVs); voids in mineral aggregate (VMAs); and voids filled with asphalt (VFAs). The fiber-related features included fiber type (FT), fiber content (FC), fiber length (FL), fiber tensile strength (TS), and fiber melting temperature (MT). In contrast to previous single-output studies that focused on only one mechanical property, both MS and ITS were used as output variables in this study to support multi-target performance prediction and subsequent multi-objective mixture design optimization.

For the categorical feature FT, the original fiber names were standardized into seven representative groups, including plastic fiber, mineral fiber, bio-fiber, carbon fiber, glass fiber, steel fiber, and no fiber. Among the 389 samples, 237 samples contained fiber reinforcement, whereas 152 samples were non-fiber asphalt concrete mixtures. The distribution of fiber categories is shown in Table 1.

Table 1. Overview of fiber categories and their amounts.

| Fiber Categories | Sample Size |
| --- | --- |
| Plastic fiber | 110 |
| Mineral fiber | 41 |
| Bio-fiber | 36 |
| Carbon fiber | 19 |
| Glass-fiber | 16 |
| Steel-fiber | 15 |
| No-fiber | 152 |
| Total | 389 |

## 2.1.2. Data Analysis

Table 2 reports the descriptive statistics for all input and output variables, including extreme values, quartiles, means, and standard deviations. Overall, the dataset spans broad ranges of binder properties, gradation indices, volumetric parameters, fiber descriptors, and production conditions, reflecting the diversity of the collected experimental sources. Asphalt-related variables, such as penetration, ductility, softening point, and asphalt con tent, all show varying degrees of variation, reflecting differences in asphalt materials and mixture designs. The aggregate gradation variables Ag2.36, Ag4.75, and Ag9.5 also have wide value ranges, indicating that the database contains asphalt mixtures with different gradations. Fiber-related variables, particularly for fiber length, tensile strength, melting temperature, and fiber content, also showed substantial dispersion, because the database included different fiber types as well as non-fiber mixtures. Among two output variables, MS ranges from 3.40 to 26.72 kN, while ITS ranges from 0.20 to 3.94 MPa, indicating that the database covers asphalt concrete samples with different mechanical performances.

Table 2. Descriptive statistics of input and output variables.

| Variable | Unit | Min | Q1 | Q2 | Q3 | Max | Mean | STD |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Pe | 0.1 mm | 37 | 47 | 65 | 71.20 | 91.80 | 64.24 | 14.82 |
| Du | cm | 85 | 100 | 100 | 150 | 168 | 119.17 | 24.94 |
| SP | ◦C | 42 | 48.20 | 50 | 51.60 | 81 | 51.75 | 7.09 |
| AC | wt.% | 3.16 | 4.70 | 5.00 | 5.50 | 10.39 | 5.20 | 0.82 |
| AV | % | 1.60 | 3.90 | 4.30 | 4.99 | 7.50 | 4.40 | 0.98 |
| VMA | % | 12.10 | 15.50 | 16.34 | 17.26 | 32.33 | 16.61 | 2.14 |
| VFA | % | 54.17 | 68.19 | 72.68 | 75.17 | 92.50 | 72.54 | 5.86 |
| Ag2.36 | % | 19.45 | 30.95 | 37.00 | 42.84 | 85.00 | 36.85 | 8.34 |
| Ag4.75 | % | 24.00 | 46.96 | 54.00 | 59.18 | 95.00 | 51.66 | 11.49 |
| Ag9.5 | % | 42.50 | 71.21 | 79.10 | 83.00 | 100.00 | 75.89 | 11.59 |
| FT | / | / | / | / | / | / | / | / |
| FC | wt.% | 0 | 0 | 0.20 | 0.40 | 2.25 | 0.27 | 0.35 |
| FL | mm | 0 | 0 | 6.00 | 12.00 | 125.00 | 9.49 | 20.77 |
| TS | MPa | 0 | 0 | 0.084 | 2320 | 4900 | 918.97 | 1329.91 |
| MT | ◦C | 0 | 0 | 0 | 220 | 1650 | 125.91 | 234.66 |
| MS | kN | 3.40 | 9.50 | 11.70 | 14.78 | 26.72 | 12.26 | 3.87 |
| ITS | MPa | 0.20 | 0.82 | 1.10 | 1.44 | 3.94 | 1.29 | 0.79 |

Figure 2 gives the Pearson correlation matrix for the input descriptors and target responses. It is observed that high correlation coefficients appear mainly between variables with clear physical relationships. For example, different sieve passing indicators, including Ag2.36, Ag4.75, and Ag9.5, show strong positive correlations, because these variables synthetically characterize the gradation composition of the mixture. Meanwhile, relatively strong correlations are also observed among volumetric parameters such as AV, VMA, and VFA, which are consistent with their inherent relationships in definition and calculation. After excluding these expected physical associations, the absolute Pearson coefficients of all remaining feature pairs are below 0.7 [24], suggesting that no severe multicollinearity exists. Therefore, the selected variables provide complementary descriptions of mixture composition and mechanical behavior and were retained as inputs for subsequent machine learning analysis.

![](images/page_4_chart_5.jpg)

Figure 2. Correlation analysis of input and output variables.

## 2.1.3. Data Preprocessing

Before model training, the constructed database was preprocessed to ensure data format consistency and meet the input requirements of machine learning models [74]. For fiber-related variables, it was necessary to distinguish differences between “non-fiber samples” and “missing data”. For non-fiber samples, the values of FC, FL, TS, and MT were assigned 0 to indicate the absence of fiber and corresponding properties. Meanwhile, the categorical variable FT was unified into seven representative categories, including plastic fiber, mineral fiber, bio-fiber, carbon fiber, glass fiber, steel fiber, and no fiber. The final dataset consisted of 15 input variables and 2 output variables. To evaluate the prediction capability of models on unknown samples, the database was divided into training and testing sets at a ratio of 8:2 in each Monte Carlo random split. This random splitting process was repeated 50 times to reduce the influence of a single data partition on model evaluation results.

## 2.2. Machine Learning Models

Table 3 lists the four models evaluated in this work, including two tabular foundation models (TabICLv2 and TabPFN) and two conventional tree-based ensemble models (RF and XGBoost). The purpose of selecting these four types of models is to compare the prediction capability of emerging tabular foundation models and traditional machine learning models on a small-scale, multi-variable, and dual-output asphalt concrete dataset.

Table 3. Overview of machine learning models.

| No. | Model | Category | Notes |
| --- | --- | --- | --- |
| 1 | TabICLv2 | Foundation model | Pretrained transformer for tabular prediction |
| 2 | TabPFN | Foundation model | In-context learning for tabular regression |
| 3 | RF | Ensemble—Bagging | Bagging of decision trees |
| 4 | XGBoost | Ensemble—Boosting | Boosting model with regularization |

Figure 3 further illustrates the differences between traditional machine learning models and tabular foundation models. Conventional models are generally fitted directly on the task-specific dataset and learn relationships between mixture descriptors and target properties from those samples. For example, RF improves stability by aggregating the outputs of multiple decision trees [75], while XGBoost continuously corrects the prediction errors of the previous model through a stepwise boosting strategy [76], thereby improv ing model fitting ability and model generalization. These models have relatively good interpretability and a mature application basis, and are therefore suitable as traditional benchmark models in this study. Different from traditional models, TabPFN and TabICLv2 are recently developed tabular foundation models, whose core advantage lies in using pretraining or in-context learning mechanisms to handle tabular prediction tasks. TabPFN acquires general-purpose tabular modeling ability from extensive pretraining on synthetic tasks and uses contextual information to generate predictions for new small-sample regres sion tasks [30]. TabICLv2 is also based on the idea of pretrained tabular models and can extract potential relationships among variables from limited samples and directly apply them to the current prediction task [31]. Therefore, these models have potential advantages in material performance prediction with limited sample sizes and complex variable types.

![](images/page_6_image_2.jpg)

Figure 3. Comparison of traditional machine learning and tabular foundation models.

## 2.3. Evaluation Metrics and Monte Carlo Validation

The prediction task in this study contains two response variables with different physical meanings and numerical scales: MS and ITS. For this reason, prediction errors were not pooled between wo outputs. Instead, each metric was computed separately for MS and ITS within each Monte Carlo split. The target-specific metrics were retained separately for performance reporting and were combined only after direction unification and dimensionless normalization in the composite evaluation.

Let s denote the index of a Monte Carlo split; k denote the target variable, where k belongs to {MS, ITS}; and i denote the sample index in the corresponding training or testing subset. For split s, the notation in Equation (1) represents the relationship of measured value, predicted value, and residual of target k for sample i:

$$
e _ { i , k } ^ { ( s ) } = y _ { i , k } ^ { ( s ) } - \hat { y } _ { i , k } ^ { ( s ) }\tag{1}
$$

where s is the Monte Carlo split index; $k \in \{ \mathrm { M S } , \mathrm { I T S } \}$ identifies the predicted target; i is the sample index; and $y _ { i , k } ^ { ( s ) } , \hat { y } _ { i , k } ^ { \bar { ( s ) } }$ , and $e _ { i , k } ^ { ( s ) }$ denote the measured value, predicted value, and residual of target k for sample i in split s, respectively.

Based on the target-specific residuals, five indicators were calculated for each target. The root mean square error (RMSE) and mean absolute error (MAE) quantify the magnitude of prediction errors in the original unit of the target variable, whereas the mean absolute percentage error (MAPE) expresses the relative error as a percentage. The coefficient of determination (R<sup>2</sup>) measures the explained variance, and the median absolute deviation (MAD) was calculated from the residuals around their median to provide a robust description of residual dispersion.

$$
\mathrm { R M S E } _ { k } ^ { ( s ) } = \sqrt { \frac { 1 } { n _ { s } } \sum _ { i = 1 } ^ { n _ { s } } \left( y _ { i , k } ^ { ( s ) } - \hat { y } _ { i , k } ^ { ( s ) } \right) ^ { 2 } }\tag{2}
$$

$$
\mathrm{MAPE}_{k}^{(s)} = \frac{100}{n_{s}} \sum_{i = 1}^{n_{s}} \left| \frac{y_{i,k}^{(s)} - \hat{y}_{i,k}^{(s)}}{y_{i,k}^{(s)}} \right|\tag{3}
$$

$$
\mathrm { M A E } _ { k } ^ { ( s ) } = \frac { 1 } { n _ { s } } \sum _ { i = 1 } ^ { n _ { s } } \left| y _ { i , k } ^ { ( s ) } - \hat { y } _ { i , k } ^ { ( s ) } \right|\tag{4}
$$

$$
R_{k}^{2,(s)} = 1 - \frac{\sum_{i = 1}^{n_{s}} \Bigl( y_{i,k}^{(s)} - \hat{y}_{i,k}^{(s)} \Bigr)^{2}}{\sum_{i = 1}^{n_{s}} \Bigl( y_{i,k}^{(s)} - \overline{y}_{k}^{(s)} \Bigr)^{2}}\tag{5}
$$

$$
\mathrm{MAD}_{k}^{(s)} = \mathrm{median}_{i} \left[ e_{i,k}^{(s)} - \mathrm{median}_{j} \left( e_{j,k}^{(s)} \right) \right]\tag{6}
$$

In Equations $( 2 ) – ( 6 ) ,   n _ { s }$ denotes the number of samples in the evaluated subset of split s; $\overline { { y } } _ { k } ^ { ( s ) }$ is the mean measured value of target $k$ in that subset; and median<sub>i</sub> and medianj indicate median operations over the corresponding sample indices. Smaller RMSE, M $\mathrm { A P E } ,$ MAE, and MAD values are related to lower prediction errors, while a larger $R ^ { 2 }$ indicates stronger agreement between measured and predicted values.

The metric results for MS and ITS were retained as a two-target vector for every split:

$$
M ^ { s } = \big ( M _ { M S } ^ { s } , M _ { I T S } ^ { s } \big ) , \; k \in \big \{ M S , I T S \big \}\tag{7}
$$

To reduce sensitivity to a particular random data partition, the complete training and testing procedure was repeated over 50 Monte Carlo splits. For each metric M and each target $k ,$ the mean test-set performance and its standard deviation were calculated separately as follows:

$$
\overline { { M } } _ { k } = \frac { 1 } { S } \Sigma _ { s = 1 } ^ { S } M _ { k } ^ { s }\tag{8}
$$

$$
S D \big ( M _ { k } \big ) = \sqrt { \frac { 1 } { S - 1 } \Sigma _ { s = 1 } ^ { S } \big ( M _ { k } ^ { s } - \overline { { M } } _ { k } \big ) ^ { 2 } }\tag{9}
$$

In Equations $( 7 )  –  ( 9 )$ , M represents any one of the five evaluation metrics; $M _ { k } ^ { s }$ <sup>denotes</sup> the value of metric M for target k in Monte Carlo split $\mathbf { S } ;$ M<sup>s</sup>is the two-target metric vector; $\overline { { M } } _ { k }$ is the mean of the target-specific metric values across $S$ <sup>s</sup>plits $( S = 5 0 ) ;$ and $S D \big ( M _ { k } \big )$ is the corresponding standard deviation.

Therefore, all reported RMSE, MAPE, $\mathrm { M A E } , \mathrm { R } ^ { 2 }$ , and MAD values remain target specific. No raw MS and ITS metric values were averaged in the performance summary, due to their different units and numerical scales.

## 2.4. Model Ranking and Comprehensive Evaluation

The five metrics describe complementary aspects of model performance and have different optimization directions. To avoid combining MS and ITS errors before considering their different units and numerical scales, all metrics were processed separately for each target. The composite score was calculated only from direction-consistent, dimensionless normalized scores and was used exclusively for relative model ranking.

For each candidate model $m ,$ metric $q \in \{ \mathrm { R M S E }$ , MAPE, MAE, $\mathbb { R } ^ { 2 }$ , MAD}, and target $k \in \{ \mathbf { M } \mathbb { S }$ , ITS}, the target-specific test metric $x _ { m , q , k }$ was first transformed into a directionconsistent utility value. Smaller values are preferred for RMSE, MAPE, MAE, and $\mathrm { M A D } ,$ whereas a larger $R ^ { 2 }$ is preferred:

$$
\begin{array} { r l } & { u _ { m , q , k } = - x _ { m , q , k } \; f o r \; q \in \big \{ R M S E , M A P E , M A E , M A D \big \} ; } \\ & { u _ { m , q , k } = x _ { m , q , k } \; f o r \; q = R ^ { 2 } } \end{array}\tag{10}
$$

For each target-metric axis, the utility values were standardized among all candidate models. The mean $\mu _ { q , k }$ and standard deviation $\sigma _ { q , k } ,$ computed over all candidate models m, were therefore calculated separately for every combination of metric q and target k:

$$
z _ { m , q , k } = \frac { u _ { m , q , k } - \mu _ { q , k } } { \sigma _ { q , k } }\tag{11}
$$

The standardized values were then mapped to a bounded interval using a sigmoid transformation with a fixed scaling parameter, ensuring that the normalized scores remained within [0, 1] while preserving the relative ordering of candidate models:

$$
S _ { m , q , k } = \frac { 1 } { 1 + \exp \Bigl ( - \frac { z _ { m , q , k } } { \alpha } \Bigr ) } .\tag{12}
$$

The final dimensionless composite score for each model m was obtained as the equalweight mean of all ten normalized target-metric scores (2 targets $\times 5$ metrics = 10 axes):

$$
C o m p o s i t e _ { m } = \frac { 1 } { 1 0 } \Sigma _ { k \in \left\{ M S , I T S \right\} } \Sigma _ { q = 1 } ^ { 5 } S _ { m , q , k }\tag{13}
$$

For the five-axis radar chart and stacked-bar display in Section 3.2, the separately normalized MS and ITS scores were averaged within each metric to produce a visualizationonly score $\overline { { S } } _ { m , q }$ that does not enter the official composite calculation:

$$
\overline { { S } } _ { m , q } = \frac { S _ { m , q , M S } + S _ { m , q , I T S } } { 2 }\tag{14}
$$

This visualization-level aggregation is performed after target-specific normalization and does not represent a direct average of raw RMSE, MAE, MAPE, MAD, or $\mathbb { R } ^ { 2 }$ values. A larger composite score indicates a more balanced overall performance among prediction accuracy, relative error, explained variance, and residual robustness.

## 2.5. Hyperparameter Tuning Through Optuna

To improve the prediction performance of traditional tree-based ensemble models, Optuna was used in this study to automatically optimize the key hyperparameters of RF and XGBoost [77]. On contrast, TabICLv2 and TabPFN are tabular foundation models whose predictive ability is mainly derived from pretraining or in-context learning. Therefore, their default configurations were adopted in this study, and no additional hyperparameter search was performed for TabICLv2 and TabPFN. The computational environment and versions of the key Python packages used for model development, statistical analysis, visualization, and GUI deployment are summarized in Table A1.

Figure 4 shows the Optuna-based hyperparameter tuning workflow. First, the corresponding hyperparameter search spaces were defined according to the characteristics of RF and XGBoost. Then, in each trial, Optuna automatically generated a candidate set of hy perparameters and constructed the corresponding model on the training set. After model training, the objective function values were calculated through 5-fold cross-validation within the training set, where the cross-validation process was randomly shuffled and the random seed was set to 42. For each model to be optimized, Optuna performed 500 trials to search for a better hyperparameter combination within the predefined search space. Since this study simultaneously predicted two mechanical performance indicators, MS and ITS, a multi-objective optimization strategy was adopted. Specifically, the cross-validation RMSE values of MS and ITS were used as two independent optimization objectives, and both values were minimized simultaneously through the multi-objective optimization mechanism of Optuna. After optimization, the compromise solution with the smallest normalized average error was selected from the Pareto-optimal solution set as the final hyperparameter combination. After the hyperparameter search was completed, the selected hyperparameter combination was used for subsequent model training and testing evaluation. Through this tuning process, the prediction stability and generalization capability of traditional tree-based ensemble models in the MS–ITS dual-output prediction task can be improved while maintaining a fair model comparison.

![](images/page_9_image_3.jpg)

Figure 4. Workflow of Optuna-based hyperparameter tuning for tree-based models.

## 2.6. Pareto Filtering and TOPSIS-Based Selection of Observed Experimental Mixtures

To support multi-objective mixture selection using only experimental data, the cleaned database was filtered first to retain samples with valid MS and ITS values. Both MS and ITS were treated as benefit criteria because larger values indicate better mechanical performance. As shown in Figure 5, the observed-data selection workflow consisted of three main steps: valid-sample filtering, Pareto-based non-dominated mixture identification, and TOPSIS-based ranking of the retained Pareto samples.

![](images/page_9_image_7.jpg)

Figure 5. Workflow of observed-data Pareto filtering and TOPSIS-based mixture selection.

Specifically, non-dominated observed mixtures were identified by Pareto filtering in the two-dimensional MS–ITS objective space [78]. A mixture was retained as a true-data Pareto sample when no other observed mixture simultaneously achieved equal or higher MS and ITS with at least one strictly higher objective value. The retained Pareto candidates were subsequently prioritized with TOPSIS [79,80]. The equal-weight scenario, in which MS and ITS were assigned weights of 0.5 and 0.5, respectively, was used as the primary ranking scheme.

## 3. Results and Discussion

## 3.1. Hyperparameter Optimization Results

Figure 6 shows the optimization histories of RF and XGBoost during Optuna tuning. In this study, the cross-validation RMSE values of MS and ITS were used as two independent optimization objectives, and the compromise solution with the smallest normalized average error was selected from the Pareto-optimal solution set as the final hyperparameter combination. The predefined hyperparameter distributions and search ranges for RF and XGBoost are summarized in Table A2 in Appendix B. From the optimization process, the objective function values of both RF and XGBoost decreased noticeably in the early trials, indicating that Optuna could gradually eliminate poor parameter combinations within the predefined search space and locate parameter regions more suitable for the MS–ITS dual-output prediction task. As the number of trials increased, further improvement in the best cross-validation error gradually became smaller, and the optimization curves generally tended to converge, suggesting that 500 trials were sufficient for hyperparameter search of traditional tree-based models in this study. It should be noted that, because MS and ITS were optimized simultaneously, the final parameter combination did not simply pursue the lowest error for a single objective, but reflected a compromise optimization result between the two mechanical performance indicators.

![](images/page_10_chart_6.jpg)

(a) MS

![](images/page_10_chart_8.jpg)

(b) ITS

Figure 6. Optimization histories of RF and XGBoost during Optuna tuning.

According to the optimization results, RF finally adopted a relatively large number of trees and a deep tree structure to enhance its ability to fit nonlinear relationships among variables. XGBoost adopted relatively large number of weak learners, shallow tree depth, and moderate regularization parameters to balance model complexity and generalization capability. The specific hyperparameter settings are shown in Table 4. Based on the optimized parameter combinations, RF and XGBoost were further included in the unified Monte Carlo testing evaluation together with TabICLv2 and TabPFN to compare their generalization performance in the MS and ITS dual-output prediction task.

Table 4. Model configurations and optimized hyperparameter settings.

| Models | Hyperparameters |
| --- | --- |
| TabICLv2 | n_estimators = 8; feat_shuffle = Latin hypercube; outlier_threshold = 4.0; batch_size = 8; device = CUDA |
| TabPFN | n_estimators = 8; auto_scale = True; softmax_temperature = 0.9; inference_precision = auto; device = CÚDA |
| RF | $\mathtt { L e p t h } = 1 9 ;$ min_samples ${ \mathrm { s p l i t } } = 2 ;$ min_samples_leaf = 1; max_features = n_estimators = 175; max_ sqrt; bootstrap = True; n_jobs = −1 |
| XGBoost | n_estimators = 718; max_ $\mathsf { L e p t h } = 9 ;$ learning_rate = 0.025; reg_alpha = 0.24; reg_lambda = 1.11; min_child $\mathrm{weight}=9.68;$ objective = reg:squarederror; tree_method = hist; n_jobs = −1 |

## 3.2. Prediction Performance

Figure 7 compares the measured and predicted values of the four models across 50 Monte Carlo train–test splits. Overall, the prediction points of TabICLv2, TabPFN, RF, and XGBoost are generally distributed around the reference line, indicating that all four models are able to capture the nonlinear relationships between the input variables and the MS and ITS responses. Among the evaluated models, the prediction points of TabICLv2 and TabPFN are more distributed around the reference line, especially for the ITS task, indicating better agreement between the measured and predicted values. On contrast, RF and XGBoost exhibit relatively greater dispersion for several high and low performance samples.

Table 5 further presents the specific test-set values of all evaluation metrics for four models across 50 Monte Carlo splits. For MS prediction, TabICLv2 performed slightly better performance than TabPFN, achieving a lower RMSE $( 1 . 4 9 \pm 0 . 2 2   \mathrm { v s . } \; 1 . 5 3 \pm 0 . 2 1   \mathrm { k N } )$ and a higher $\mathsf { R } ^ { 2 } ( 0 . 8 5   \pm   0 . 0 4 \mathrm { v s . } \quad 0 . 8 4   \pm   0 . 0 4 )$ . For ITS prediction, TabPFN showed a slight advantage, with lower RMSE and MAPE and higher $\mathbb { R } ^ { 2 }$ . RF and XGBoost generally produced larger prediction errors than two tabular foundation models. Overall, TabICLv2 showed clearer advantage in MS prediction, whereas TabPFN performed slightly better performance in ITS prediction; both models demonstrated strong potential for smallsample, multivariable, and dual-output prediction tasks. In addition, Table 5 reports the computational speeds of all models on an Intel Core i7-12800HX CPU and an NVIDIA GeForce RTX 4070 Laptop GPU (8 GB), expressed as the average runtime per Monte Carlo split.

Table 5. Model performance summary over 50 Monte Carlo splits.

| Model | RMSE | MAE | MAPE (%) | MAD | R<sup>2</sup> | Time (s/Split) |
| --- | --- | --- | --- | --- | --- | --- |
|  | MS: 1.49 ± 0.22 | MS: 1.03 ± 0.11 | MS: 8.68 ± 1.18 | MS: 0.72 ± 0.11 | MS: 0.85 ± 0.04 |  |
| TabICLv2 | ITS: 0.24 ± 0.08 | ITS: 0.13 ± 0.03 | ITS: 11.75 ± 3.23 | ITS: 0.07 ± 0.01 | ITS: 0.90 ± 0.07 | 1.45 ± 0.05 |
|  | MS: 1.53 ± 0.21 | MS: 1.06 ± 0.12 | MS: 8.84 ± 1.24 | MS: 0.72 ± 0.11 | MS: 0.84 ± 0.04 |  |
| TabPFN | ITS: 0.23 ± 0.08 | ITS: 0.13 ± 0.03 | ITS: 10.92 ± 2.76 | ITS: 0.07 ± 0.01 | ITS: 0.91 ± 0.06 | 3.39 ± 0.23 |
|  | MS: 1.61 ± 0.24 | MS: 1.15 ± 0.14 | MS: 10.02 ± 1.61 | MS: 0.82 ± 0.12 | MS: 0.82 ± 0.05 |  |
| RF | ITS: 0.27 ± 0.05 | ITS: 0.17 ± 0.03 | ITS: 18.40 ± 5.31 | ITS: 0.10 ± 0.02 | ITS: 0.88 ± 0.05 | 0.27 ± 0.02 |
|  | MS: 1.63 ± 0.20 | MS: 1.16 ± 0.12 | MS: 9.73 ± 1.24 | MS: 0.80 ± 0.10 | MS: 0.81 ± 0.04 |  |
| XGBoost | ITS: 0.27 ± 0.06 | ITS: 0.16 ± 0.02 | ITS: 16.08 ± 5.42 | ITS: 0.09 ± 0.01 | ITS: 0.88 ± 0.06 | 1.26 ± 0.13 |

Note: RF and XGBoost were evaluated on an Intel Core i7-12800HX CPU; TabPFN and TabICLv2 were evaluated on an NVIDIA GeForce RTX 4070 Laptop GPU (8 GB).

![](images/page_12_chart_2.jpg)

![](images/page_12_chart_3.jpg)

(a) TabICLv2

![](images/page_12_chart_5.jpg)

![](images/page_12_chart_6.jpg)

(b) TabPFN

![](images/page_12_chart_8.jpg)

![](images/page_12_chart_9.jpg)

(c) RF

![](images/page_12_chart_11.jpg)

![](images/page_12_chart_12.jpg)

(d) XGBoost

Figure 7. Measured and predicted values of MS and ITS for different models.

To provide a unified comparison of model performance, Figure 8 presents a comprehensive evaluation based on the direction-consistent and dimensionless scores of five metrics. Figure 8a shows the normalized scores for five evaluation metrics. Overall, TabICLv2 and TabPFN achieved higher scores than RF and XGBoost among most metric dimensions, indicating that two tabular models provided more balanced prediction perfor mance. Their score profiles were similar, although TabPFN showed a slight advantage in MAPE, whereas TabICLv2 performed slightly better on the other four metrics. Figure 8b further integrates five normalized metrics into an equal-weight composite score for overall model ranking. TabICLv2 achieved the highest composite score 0.876, followed closely by TabPFN with a score of 0.859. In comparison, RF and XGBoost performed much worse than two tabular models in comprehensive evaluation metrics, but they still maintained acceptable prediction accuracy and can therefore serve as reliable benchmark models.

![](images/page_13_image_3.jpg)

(a) Normalized metric scores

![](images/page_13_chart_5.jpg)

(b) Composite ranking scores

Figure 8. Comprehensive comparison of model performance based on multiple metrics.

To determine whether the observed performance differences were statistically significant, formal paired comparisons were conducted across 50 matched Monte Carlo splits. As summarized in Table A3 in Appendix B, the Friedman tests indicated significant overall differences among four models for all evaluation metrics of both MS and ITS. Subsequent pairwise Wilcoxon signed-rank tests with Holm correction further showed that TabPFN and TabICLv2 significantly outperformed RF and XGBoost in all reported comparisons. Notably, TabPFN and TabICLv2 achieved these competitive results using default configurations, whereas RF and XGBoost underwent 500 Optuna tuning trials, indicating strong performance with substantially less task-specific hyperparameter tuning.

Figure 9 further demonstrates the robustness of the model evaluation across 50 Monte Carlo train–test splits. Although the cumulative mean composite scores fluctuated during the early splits, they gradually stabilized as the number of repetitions increased. TabICLv2 and TabPFN consistently maintained higher cumulative mean scores than RF and XGBoost, indicating that the relative model ranking was not affected by individual data partitions. The cumulative standard deviations, shown by the dashed lines, also became increasingly stable in the later splits, supporting the reliability of the performance estimates obtained from the full 50-split evaluation.

![](images/page_14_chart_2.jpg)

Figure 9. Stability of model composite-score estimates across 50 Monte Carlo train-test splits.

## 3.3. Sensitivity Analysis of Non-Fiber Encoding

To evaluate whether the encoding of non-fiber samples affects prediction results, Figure 10 illustrates two comparable modeling strategies. Under pooled encoding, all 389 samples were included in a single model. For 237 fiber-reinforced samples, FT, FC, FL, TS, and MT were used as applicable fiber-related descriptors. For 152 non-fiber samples, FT was coded as No\_fiber, whereas FC, FL, TS, and MT were set to be 0 because these variables were not applicable. Under the separated-model strategy, fiber-reinforced and non-fiber samples were modeled independently. The fiber model used both common mixture variables and fiber-related variables, whereas the non-fiber model used only 10 common mixture variables applicable to both groups. The predictions from the two subgroup models were then combined for evaluation. This design enables a direct comparison between pooled encoding and fiber-status-specific modeling under matched data partitions.

![](images/page_14_image_6.jpg)

Figure 10. Pooled and separated strategies for non-fiber samples.

Table 6 further quantifies the performance of the two strategies using TabPFN across 50 matched Monte Carlo splits. For all test samples, pooled encoding achieved higher $\mathbb { R } ^ { 2 }$ and lower RMSE values for both MS and ITS. For MS, the pooled encoding strategy obtained an $\mathbb { R } ^ { 2 } \; \mathrm { o f } \; 0 . 8 3 7 \pm 0 . 0 4 3$ and an RMSE of $1 . 5 2 9 \pm 0 . 2 0 9 \; \mathrm { k N } ,$ compared with $0 . 7 9 5 \pm 0 . 0 6 2$ and $1 . 7 1 0 \pm 0 . 2 6 8 \: \mathrm { k N }$ for the separated models. For ITS, the corresponding values were $0 . 9 0 3 \pm 0 . 0 6 9$ and $0 . 2 3 1 \pm 0 . 0 7 8$ MPa for pooled encoding, versus $0 . 8 7 7 \pm 0 . 0 8 3$ and $0 . 2 6 1 \pm 0 . 0 8 0   \mathrm { M P a }$ for the separated models. The paired Wilcoxon tests showed significant RMSE differences for all samples and the non-fiber subset for both targets. For the fiber-only subset, the difference was significant for MS $( p = 0 . 0 0 4 )$ but not for ITS $( p = 0 . 1 2 6 )$ These results indicate that pooled encoding generally provided better predictive performance, with the clearest improvements observed for non-fiber samples, while maintaining comparable ITS performance for fiber-reinforced samples.

Table 6. Sensitivity analysis of TabPFN performance under pooled and separated fiber-status modeling strategies.

<table><tr><td>Target</td><td>Test Subset</td><td>Pooled  $\mathbf { E n c o d i n g } \; \mathbf { R } ^ { 2 }$ </td><td>Separated  $\mathbf { M o d e l s \; R ^ { 2 } }$ </td><td>Pooled Encoding RMSE</td><td>Separated Models RMSE</td><td>Wilcoxon  $p \mathrm { - V a l u e }$ </td></tr><tr><td>MS</td><td>All samples</td><td> $0 . 8 3 7 \pm 0 . 0 4 3$ </td><td> $0 . 7 9 5 \pm 0 . 0 6 2$ </td><td> $1 . 5 2 9 \pm 0 . 2 0 9 \: \mathrm { k N }$ </td><td> $1 . 7 1 0 \pm 0 . 2 6 8 \: \mathrm { k N }$ </td><td>&lt;0.001</td></tr><tr><td rowspan="5">ITS</td><td>Fiber-only</td><td> $0 . 8 7 0 \pm 0 . 0 4 7$ </td><td> $0 . 8 5 1 \pm 0 . 0 7 5$ </td><td> $1 . 3 3 6 \pm 0 . 2 3 6 \: \mathrm { k N }$ </td><td> $1 . 4 1 1 \pm 0 . 3 2 1 \: \mathrm { k N }$ </td><td>0.004</td></tr><tr><td>Non-fiber-only</td><td> $0 . 7 7 0 \pm 0 . 0 8 5$ </td><td> $0 . 6 9 0 \pm 0 . 1 1 6$ </td><td> $1 . 7 6 7 \pm 0 . 3 0 4 \: \mathrm { k N }$ </td><td> $2 . 0 5 6 \pm 0 . 4 0 4 \: \mathrm { k N }$ </td><td>&lt;0.001</td></tr><tr><td>All samples</td><td> $0 . 9 0 3 \pm 0 . 0 6 9$ </td><td> $0 . 8 7 7 \pm 0 . 0 8 3$ </td><td> $0 . 2 3 1 \pm 0 . 0 7 8   \mathrm { M P a }$ </td><td> $0 . 2 6 1 \pm 0 . 0 8 0   \mathrm { M P a }$ </td><td>&lt;0.001</td></tr><tr><td>Fiber-only</td><td> $0 . 9 1 4 \pm 0 . 0 8 1$ </td><td> $0 . 9 1 1 \pm 0 . 0 8 7$ </td><td> $0 . 2 4 0 \pm 0 . 1 0 4   \mathrm { M P a }$ </td><td> $0 . 2 4 3 \pm 0 . 1 0 1   \mathrm { M P a }$ </td><td>0.126</td></tr><tr><td>Non-fiber-only</td><td> $0 . 8 1 7 \pm 0 . 1 1 1$ </td><td> $0 . 6 4 6 \pm 0 . 1 9 5$ </td><td> $0 . 1 9 5 \pm 0 . 0 7 2   \mathrm { M P a }$ </td><td> $0 . 2 7 3 \pm 0 . 0 8 5   \mathrm { M P a }$ </td><td>&lt;0.001</td></tr></table>

Note: Values are reported as mean ± standard deviation across 50 matched Monte Carlo train–test splits. The p-values were obtained from two-sided paired Wilcoxon signed-rank tests based on split-wise RMSE values. RMSE is expressed in kN for MS and MPa for ITS.

## 3.4. Observed-Data Pareto Front and TOPSIS-Based Mixture Selection

## 3.4.1. Observed Pareto Front and TOPSIS Ranking

The observed-data selection results are summarized in Figure 11. After filtering the experimental database, 389 samples with valid MS and ITS values were retained for multi-objective evaluation, among which only 9 samples were identified as Pareto samples. These samples represent the experimentally observed upper boundary of the MS-ITS objective space, where no other observed mixture simultaneously achieved equal-or-higher MS and ITS with at least one higher objective value.

Table 7 presents the complete feature information and equal-weight TOPSIS ranking results of 9 Pareto samples. E122 ranked first, with MS = 15.23 kN, $\mathrm { I T S } = 3 . 9 0   \mathrm { M P a } ,$ and a TOPSIS score of 0.572, followed by E112 with a TOPSIS score of 0.522. Although E122 did not achieve the maximum value of either individual objective, it combined a high-level ITS value with a moderate-to-high MS value and therefore represented the best compromise solution under the equal-weight scenario. In contrast, E263 achieved the highest MS of 26.72 kN but a relatively low ITS of 1.66 MPa, whereas E239 achieved the highest ITS of 3.94 MPa but a lower MS of 10.78 kN, further illustrating the trade-off between the two mechanical properties.

![](images/page_16_chart_2.jpg)

Figure 11. Pareto front and TOPSIS selection for observed MS-ITS data.

Table 7. Information and TOPSIS ranking of the observed-data Pareto solutions.

| Feature | E122 | E112 | E263 | E265 | E239 | E266 | E267 | E069 | E126 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Rank | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
| FT | Mineral | Mineral | Carbon | Carbon | Plastic fiber | Carbon fiber | Carbon fiber | No-fiber | Plastic fiber |
| Pe | fiber 91.6 | fiber 91.8 | fiber 60 | fiber 60 | 85.9 | 60 | 60 | 47 | 57 |
| Du | 150.00 | 150.00 | 100.00 | 100.00 | 100.00 | 100.00 | 100.00 | 100.00 | NA |
| SP | 46.90 | 49.60 | 42.00 | 42.00 | 46.50 | 42.00 | 42.00 | 61.00 | 51.60 |
| AC | 5.27 | 5.80 | 6.20 | 6.50 | 4.00 | 5.90 | 6.70 | 4.30 | 4.65 |
| AV | 3.10 | 3.36 | 4.89 | 5.29 | 3.81 | 7.01 | 6.08 | 3.90 | 4.41 |
| VMA | 14.20 | 16.75 | 14.84 | 15.19 | NA | 17.69 | 15.90 | 12.10 | NA |
| VFA | 78.60 | 79.94 | 67.03 | 65.20 | NA | 60.35 | 61.78 | 67.77 | NA |
| Ag2.36 | 33.90 | 37.00 | 37.70 | 37.70 | 23.00 | 37.70 | 37.70 | 26.60 | 39.06 |
| Ag4.75 | 54.80 | 53.00 | 54.00 | 54.00 | 33.50 | 54.00 | 54.00 | 37.90 | 48.63 |
| Ag9.5 | 80.90 | 76.50 | 79.10 | 79.10 | 55.50 | 79.10 | 79.10 | 58.30 | 76.27 |
| FC | 0.20 | 0.30 | 0.40 | 0.60 | 0.23 | 0.80 | 0.80 | 0.00 | 0.075 |
| FL | 6 | 6 | 6 | 6 | 6 | 6 | 6 | 0 | 4 |
| TS | 2320 | 2320 | 3500 | 3500 | 591 | 3500 | 3500 | 0 | 780 |
| MT | NA | NA | NA | NA | 259 | NA | NA | 0 | NA |
| MS | 15.23 | 13.06 | 26.72 | 24.95 | 10.78 | 20.55 | 19.22 | 15.26 | 15.56 |
| ITS | 3.90 | 3.91 | 1.66 | 1.76 | 3.94 | 1.90 | 2.06 | 2.71 | 2.34 |
| TOPSIS | 0.572 | 0.522 | 0.516 | 0.496 | 0.484 | 0.402 | 0.380 | 0.370 | 0.299 |

## 3.4.2. Design Implications for Mixture Selection

Table 8 summarizes the main design pathways derived from the Pareto samples. For the balanced MS–ITS pathway, E122 and E112 both employed mineral-fiber systems, with fiber contents of 0.20–0.30%, a fiber length of 6 mm, and asphalt contents of 5.27–5.80%. Their MS values ranged from 13.06 to 15.23 kN, while their ITS values remained high within 3.90–3.91 MPa. These results suggest that, within the current database, low-dosage mineral-fiber systems with a fiber length of 6 mm may provide a candidate design window for balanced stability and tensile resistance.

Table 8. Design-oriented summary of observed-data Pareto solutions.

| Design Pathway | Representative Pareto Solutions | Fiber System | FC (%) | FL (mm) | AC (%) | MS (kN) | ITS (MPa) | Design Implication |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Balanced MS-ITS | E122, E112 | Mineral fiber (basalt) | 0.20-0.30 | 6.00 | 5.27–5.80 | 13.06-15.23 | 3.90-3.91 | Candidate window for balanced MS-ITS performance High MS can be |
| MS- dominant | E263, E265, E266, E267 | Carbon fiber (carbon) | 0.40–0.80 | 6.00 | 5.90-6.70 | 19.22-26.72 | 1.66-2.06 | achieved, but with a lower ITS level Highest ITS, |
| ITS- dominant | E239 | Plastic fiber (polyester) | 0.23 | 6.00 | 4.00 | 10.78 | 3.94 | although MS compensation may be required |
| No-fiber reference | E069 | No fiber Plastic fiber | 0.00 | 0.00 | 4.30 | 15.26 | 2.71 | Non-fiber Pareto baseline Lower-ranked |
| Plastic-fiber reference | E126 | (polyacry- lonitrile) | 0.075 | 4.00 | 4.65 | 15.56 | 2.34 | plastic-fiber Pareto option |

For the MS-dominant pathway, the carbon-fiber samples E263, E265, E266, and E267 achieved higher MS values of 19.22–26.72 kN, with fiber contents of 0.40–0.80%, a fiber length of 6 mm, and asphalt contents of 5.90–6.70%; however, their ITS values were limited to 1.66–2.06 MPa. On contrast, the ITS-dominant sample E239, which used plastic fiber at a content of 0.23%, achieved the highest ITS of 3.94 MPa but a comparatively lower MS of 10.78 kN. In addition, the no-fiber sample E069 remained on the Pareto front, indicating that fiber reinforcement is not the only route to obtaining a favorable MS–ITS combination, while E126 provides an additional plastic-fiber reference. The final mixture selection should be made according to whether balanced MS–ITS performance, MS-dominant performance, or ITS-dominant performance is desired and should be validated through subsequent experiments.

## 4. Graphical User Interface Platform

For practical application of the proposed framework, a web-based GUI was developed using Streamlit, as shown in Figure 12, and is available at [https://acmsitsgui-35achzf3lbbswu8cjarmmj.streamlit.app/](https://acmsitsgui-35achzf3lbbswu8cjarmmj.streamlit.app/) (accessed on 3 August 2026). After users enter mixture composition, aggregate gradation, volumetric parameters, and fiber-related variables, the platform provides real-time predictions of Marshall Stability (MS) and Indirect Tensile Strength (ITS). The predicted mixture is also displayed in the MS-ITS performance trade-off space relative to the experimental samples and Pareto front, thereby providing an intuitive reference for preliminary asphalt-mixture design [81].

Considering that the GUI is deployed in a CPU-resource-constrained Streamlit Community Cloud environment, Random Forest (RF) was selected as the underlying prediction model for both MS and ITS to balance predictive accuracy, online inference efficiency, and local interpretability. Although TabPFN and TabICLv2 achieved superior overall predictive performance, RF retained good predictive capability with lower CPU inference overhead and enabled efficient local explanations using TreeSHAP. Therefore, RF was considered more suitable for deployment in a real-time interactive GUI; this deployment choice does not alter the performance comparison or ranking of the four models reported above.

## Fiber-Reinforced Asphalt Concrete Marshall Stability & Indirect Tensile Strength Prediction

<table><tr><td colspan="5">Multi-target Prediction SHAP Interpretation</td></tr><tr><td colspan="5">Input Parameters</td></tr><tr><td>Pe (0.1 mm)</td><td>Du (cm)</td><td></td><td>SP (°C)</td><td></td></tr><tr><td>71.00</td><td>+ 1</td><td>100.00</td><td>49.00 +</td><td></td></tr><tr><td>AC (wt.%)</td><td>AV (%)</td><td></td><td>VMA (%)</td><td></td></tr><tr><td>5.10</td><td>4.30 +</td><td></td><td>16.30 +</td><td>+</td></tr><tr><td>VFA (%)</td><td></td><td>Ag2.36 (%)</td><td>Ag4.75 (%)</td><td></td></tr><tr><td>72.70</td><td>+</td><td>37.00</td><td>53.60 +</td><td></td></tr><tr><td>Ag9.5 (%)</td><td></td><td>FT (Fiber Type)</td><td>FC (wt.%)</td><td></td></tr><tr><td>79.00</td><td>+ 一</td><td>No_fiber</td><td>0.00</td><td>+</td></tr><tr><td>FL (mm)</td><td></td><td>TS (MPa)</td><td>MT (°C)</td><td></td></tr><tr><td>0.00</td><td>+</td><td>0.00</td><td>165.00 +</td><td>x</td></tr></table>

## Predict MS & ITS

(a) Input interface

Performance Trade-off Visualization

![](images/page_18_chart_7.jpg)

(b) Prediction output and trade-off visualization

Waterfall Plots (Feature Contributions)

![](images/page_18_chart_10.jpg)

![](images/page_18_chart_11.jpg)

(c) SHAP explanation

Figure 12. Streamlit-based GUI for MS and ITS prediction and interpretation.

## 5. Discussion

## 5.1. Overall Effectiveness

As shown in Table 9, previous machine learning studies have demonstrated the feasibil ity of predicting asphalt-mixture properties, although direct numerical comparisons remain limited by differences in datasets, input variables, and validation strategies. The main con tribution of present study is therefore not only the simultaneous prediction of MS and ITS, but also the integration of prediction with explicit trade-off analysis and decision-oriented mixture screening. The results suggest that tabular models are well suited to small-sample and heterogeneous material datasets, whereas RF and XGBoost remain useful benchmark and deployment models because of their computational efficiency and interpretability. In addition, the combination of Pareto filtering and TOPSIS preserves experimentally observed mixtures with different MS–ITS trade-offs and provides transparent design guidance within the current database, rather than claiming generally optimal mixture proportions.

Table 9. Comparison of related ML prediction studies and the present study.

| Study | Dataset Scale | Prediction Target | Best Model | Best Reported Predictive Performance |
| --- | --- | --- | --- | --- |
| [19] | $\mathrm { A B C } \colon n = 2 5 3 ; \mathrm { A W C } \mathrm { : }$ $n = 3 4 3 ; 8 \mathrm { i n p u t s }$ | Marshall stability and Marshall flow value | MEP | $\mathrm { M S } { : } \; \mathrm { R } ^ { 2 } = 0 . 8 1 { - } 0 . 9 4 ,$ RMSE = 43.32–46.71 kg; Marshall $\mathrm{flow}: \mathbb{R}^2 = 0.92 - 0.94,$ $\mathrm { R M S E } = 0 . 4 1 { - } 0 . 9 0 .$ |
| [20] | $1 7 . 9 2 0 \mathrm { r a w ~ r e c o r d s } ; \mathrm { f i n a l }$ $n = 2013 for HWT\_and$ $n = 1 8 6 6 \; \mathrm { f o r \; I T S }$ | Hamburg wheel tracking rut depth and Indirect tensile strength | Extra Trees | $\mathbb { R } ^ { 2 } = 0 . 9 2 ; \mathrm { I T S } { : }$ HWT rut depth: $\mathbb { R } ^ { \hat { 2 } } = 0 . 9 0 .$ |
| [26] | $\begin{array} { c } { { n = 2 4 9 0 ; 1 5 \mathrm { i n p u t s } ; 6 \mathrm { f i b e r } } } \\ { { \mathrm { c a t e g o r i e s } } } \end{array}$ | Marshall stability, Marshall flow value, and Marshall quotient | Voting model | $\mathrm{MS}:\mathrm{R}^{2}=0.89,\mathrm{RMSE}=1.51;\mathrm{flow}:$ $\mathbb { R } ^ { 2 } = 0 . 8 5 , \mathrm { R M S E } = 1 . 1 6 ; \mathrm { M a r s h a l l }$ $\mathsf { q u o t i e n t } \colon \mathsf { R } ^ { 2 } = 0 . 8 8 , \mathsf { R M S E } = 0 . 6 0 .$ |
| [27] | n = 296; 14 inputs | Splitting strength | TabPFN | $\mathbb { R } ^ { 2 } = 0 . 8 5 \pm 0 . 0 8 ;$ $\mathrm { R M S E } = 0 . 3 4 \pm 0 . 1 0 \mathrm { M P a } .$ |
| [29] | n = 732; 8 inputs | Marshall stability and Marshall flow value | RF | $\mathrm{MS}:\mathbb{R}^{2}=0.93,\mathrm{RMSE}=1.70;$ $\begin{array} { r } { \mathrm { M a r s h a l l ~ f l o w : ~ } \mathbb { R } ^ { 2 } = 0 . 8 1 , \quad } \\ { \mathrm { R M S E } = 0 . 3 6 . \quad } \end{array}$ |
| Present study | n = 389; 15 inputs | Marshall stability and Indirect tensile strength | TabICLv2 for MS; TabPFN for ITS | $\mathrm { M S } \colon \mathbb { R } ^ { 2 } = 0 . 8 5 \pm 0 . 0 4 ,$ $\mathrm{RMSE}=1.49 \pm 0.22 \mathrm{kN}; \mathrm{ITS}:$ $\mathbb { R } ^ { 2 } = 0 . 9 1 \pm 0 . 0 6 ,$ $\mathrm { R M S E } = 0 . 2 3 \pm 0 . 0 8 \mathrm { \acute { M } P a } .$ |

Note: n denotes the dataset size.

## 5.2. Challenges and Limitations

Although the machine learning framework constructed in this study shows good effec tiveness in the dual-index prediction of MS and ITS and mixture selection, some challenges and limitations still remain. (1) The current database contains 389 experimental samples, and the data scale is relatively limited, with a certain degree of heterogeneity in sample sources. Material sources, test conditions, and preparation processes may differ among dif ferent studies. Meanwhile, some important material parameters and test information have not yet been included as model inputs, such as fiber surface treatment methods, aggregate morphology, asphalt modification type, and forming method. This may limit the model’s ability to fully characterize complex material behavior. (2) For non-fiber samples, this study assigned fiber-related variables such as fiber content, fiber length, and tensile strength to 0 to distinguish non-fiber samples from fiber-reinforced samples. Although this treatment helps unify the data format and meet the input requirements of the models, it may also introduce certain encoding correlations among fiber-related variables, thereby affecting the model’s in dependent identification of fiber effects. (3) The Pareto filtering and TOPSIS methods adopted in this study mainly conduct performance trade-off analysis and candidate mixture selection within the range of existing experimental samples. Therefore, the results should be under stood as balanced selections within current database rather than generally optimal mixture proportions. In addition, this study only used Marshall stability and indirect tensile strength as optimization objectives, and has not further considered factors such as moisture stability, fatigue performance, material cost, and environmental impact. Therefore, the current selection results are more suitable used as references for preliminary mix proportion analysis and subsequent experimental validation, rather than directly replacing a complete engineering design and performance evaluation process.

## 5.3. Future Research Perspectives

In response to the above limitations, future research can further improve the current framework from three aspects: data expansion, variable encoding optimization, and multi-objective design extension. First, the scale of the asphalt concrete database should be continuously expanded, and the completeness and consistency of data fields should be improved. In addition to the existing input features, future studies can further include information such as fiber surface treatment methods, aggregate morphology, asphalt modification type, forming method, test temperature, and loading conditions. This would allow the effects of different material compositions and test conditions on MS and ITS to be more comprehensively characterized, and improve the generalization performance of the model on external data and practical engineering scenarios. Second, regarding the differences between non-fiber samples and fiber-reinforced samples, future studies can explore more reasonable feature representation methods, such as introducing an independent fiber-presence variable, adopting group-based modeling strategies, or designing encoding methods that more suitable for mixed-type material data. These methods may reduce the encoding correlations caused by zero assignment of fiber-related variables and enhance the model’s ability to independently identify fiber effects. Finally, in terms of mixture selection and optimization, future studies can further combine machine learning prediction models, engineering constraints, and multi objective optimization algorithms based on existing observed-data Pareto filtering and TOPSIS analysis, to generate and screen new candidate mix proportions. Meanwhile, the optimization objectives should also be extended from MS and ITS to multiple objectives, including moisture stability, fatigue performance, material cost, and environmental impact. The reliability of the model-recommended results should also be verified through experiments, thereby promoting the development of the current framework from preliminary performance analysis toward a more complete intelligent design method for asphalt mixtures.

## 6. Conclusions

This study constructed a machine learning framework for the dual-parameter prediction of Marshall stability and indirect tensile strength and data-driven mixture optimization for the preliminary design of asphalt concrete. Based on the current research results, the main conclusions are as follows:

This study established an asphalt concrete database containing 389 experimental samples and selected 15 input variables to characterize factors, such as asphalt properties, aggregate gradation, volumetric parameters, and fiber characteristics. Different from prediction tasks that focus only on a single mechanical property, this study used both MS and ITS as output indicators, providing a data basis for the dual-index performance prediction and subsequent mix proportion selection of asphalt mixtures.

In terms of model prediction, TabPFN and TabICLv2 demonstrated strong comprehensive predictive performance for small-sample, multivariable tabular data, outperforming the Optuna-optimized RF and XGBoost models overall. For MS prediction, TabICLv2 performed slightly better, achieving an $\mathbb { R } ^ { 2 }$ of 0.85 ± 0.04 and an RMSE of 1.49 ± 0.22 kN, compared with $0 . 8 4 \pm 0 . 0 4$ and $1 . 5 3 \pm 0 . 2 1$ kN for TabPFN. For ITS prediction, TabPFN showed a slight advantage, with an $\mathbb { R } ^ { 2 }$ of $0 . 9 1 \pm 0 . 0 6$ and an RMSE of $0 . 2 3 \pm 0 . 0 8   \mathrm { M P a } .$ RF and XGBoost also maintained acceptable predictive accuracy and can serve as reliable benchmark models. Based on the normalized integration of multiple evaluation metrics, TabICLv2 achieved the highest composite score of 0.876, followed closely by TabPFN with 0.859, confirming their comparable and superior overall performance.

Nine Pareto samples were identified from the 389 valid samples, indicating that only a limited number of observed mixtures simultaneously achieved relatively high MS and ITS. A clear trade-off was observed between the two properties, suggesting that maximizing either indicator alone does not necessarily produce the most balanced mixture. Among the Pareto samples, E122 provided the best compromise under the equal-weight TOPSIS scenario, with an MS of 15.23 kN and an ITS of 3.90 MPa. Based on the characteristics of the Pareto samples, several design-oriented implications were obtained. For balanced MS–ITS performance, low-dosage mineral-fiber systems may be prioritized, with fiber contents of 0.20–0.30%, a fiber length of 6 mm, and asphalt contents of 5.27–5.80%. For MS-oriented design, carbon-fiber systems showed greater potential, corresponding to fiber contents of 0.40–0.80% and asphalt contents of 5.90–6.70%. For ITS-oriented design, the plastic-fiber sample with a fiber content of 0.23% and an asphalt content of 4.00% achieved the highest ITS. In addition, one non-fiber sample remained on the Pareto front, indicating that fiber reinforcement is not the only pathway to achieving a favorable MS–ITS combination.

To improve the practical usability of the model, this study further developed a graphical user interface platform based on Streamlit. The platform integrates real-time MS and ITS prediction, MS–ITS performance trade-off visualization, and local explanation functions, helping users intuitively evaluate the relative position of the input mix proportion among the experimental samples and the Pareto front and assisting in the understanding of the model prediction results.

**Author Contributions:** Conceptualization: X.T. and J.X.; methodology: X.T. and J.X.; software: J.X.; validation: P.G., D.J. and Y.W.; formal analysis: J.X.; investigation: J.X. and X.T.; resources: X.T. and M.G.; data curation: J.X. and X.T.; writing—original draft preparation: X.T. and J.X.; writing—review and editing: X.T., D.J., P.G. and M.G.; visualization: J.X.; supervision: X.T.; project administration: X.T. and D.J.; funding acquisition, X.T. All authors have read and agreed to the published version of the manuscript.

**Funding:** This research was funded by the National Natural Science Foundation of China (Grant No: 52508343), Basic Research Program of Jiangsu province (Grant No: BK20251486), and Fundamental Research Funds for the Central Universities (Grant No: B250201004).

**Data Availability Statement:** The original contributions presented in this study are included in the article. Further inquiries can be directed to the corresponding authors.

**Conflicts of Interest:** Author Mu Guo was employed by the company Shanghai Research Institute of Building Science Co., Ltd. The remaining authors declare that the research was conducted in the absence of any commercial or financial relationships that could be construed as potential conflicts of interest.

## Abbreviations

| Abbreviation | Full name |
| --- | --- |
| GUI | Graphical User Interface |
| ITS | Indirect Tensile Strength |
| MAD | Median Absolute Deviation |
| MAE | Mean Absolute Error |
| MAPE | Mean Absolute Percentage Error |
| MS | Marshall Stability |
| R² | Coefficient of Determination |
| RF | Random Forest |
| RMSE | Root Mean Square Error |

| SHAP | SHapley Additive exPlanations |
| --- | --- |
| TabICLv2 | Tabular In-Context Learning version 2 |
| TabPFN | Tabular Prior-data Fitted Network |
| TOPSIS | Technique for Order Preference by Similarity to Ideal Solution |
| XGBoost | Extreme Gradient Boosting |

## Appendix A. Software Environment and Dataset Characteristics

Table A1. Computational setup and key Python packages.

| Category | Software/Library | Version |
| --- | --- | --- |
| Programming environment | Python | 3.13.12 |
| Numerical computing | NumPy | 2.4.3 |
| Data processing | pandas | 3.0.1 |
| Machine learning | scikit-learn | 1.6.1 |
| Machine learning | XGBoost | 3.2.0 |
| Foundation model | TabPFN | 8.0.8 |
| Foundation model | TabICLv2/tabicI | 2.1.1 |
| Deep learning backend | PyTorch | 2.6.0+cu124 |
| Explainable AI | SHAP | 0.52.0 |
| Visualization | matplotlib | 3.10.9 |
| Model persistence | joblib | 1.5.3 |
| GUI development | Streamlit | 1.58.0 |

![](images/page_22_chart_6.jpg)

![](images/page_22_chart_7.jpg)

![](images/page_22_chart_8.jpg)

![](images/page_22_chart_9.jpg)

![](images/page_22_chart_10.jpg)

Figure A1. Cont.

![](images/page_22_chart_12.jpg)

![](images/page_23_chart_2.jpg)

![](images/page_23_chart_3.jpg)

![](images/page_23_chart_4.jpg)

![](images/page_23_chart_5.jpg)

![](images/page_23_chart_6.jpg)

![](images/page_23_chart_7.jpg)

![](images/page_23_chart_8.jpg)

![](images/page_23_chart_9.jpg)

![](images/page_23_chart_10.jpg)

![](images/page_23_chart_11.jpg)

Figure A1. Distribution characteristics of dataset features.

## Appendix B. Model Settings and Prediction Performance

Table A2. Optuna Search Space.

<table><tr><td>Model</td><td>Parameter</td><td>Distribution</td><td>Search Range</td><td>Selected Value</td></tr><tr><td>RF</td><td>n_estimators</td><td>Int (uniform)</td><td>100-700</td><td>175</td></tr><tr><td rowspan="9">XGBoost</td><td>max_depth</td><td>Int (uniform)</td><td>3-30</td><td>19</td></tr><tr><td>min_samples_split</td><td>Int (uniform)</td><td>2-12</td><td>2</td></tr><tr><td>min_samples_leaf</td><td>Int (uniform)</td><td>1-6</td><td>1</td></tr><tr><td>max_features</td><td>Categorical</td><td> $\{ \mathrm { s q r t } , \log _ { 2 } , 1 . 0 \}$ </td><td>sqrt</td></tr><tr><td>n_estimators</td><td>Int (uniform-)</td><td> $\bar { 1 0 0 } \bar { - 8 0 0 }$ </td><td>718</td></tr><tr><td>max_depth</td><td>Int (uniform) Float</td><td>2-10</td><td>9</td></tr><tr><td>learning_rate</td><td>(log-uniform)</td><td> $1 0 ^ { - 3 } – 0 . 1$ </td><td>0.025</td></tr><tr><td>reg_alpha</td><td>Float (log-uniform)</td><td> $1 0 ^ { - 4 }     -     1 0$ </td><td>0.24</td></tr><tr><td>reg_lambda</td><td>Float</td><td> $1 0 ^ { - 4 }     -     1 0$ </td><td>1.11</td></tr><tr><td></td><td>min_child_weight</td><td>(log-uniform) Float (uniform)</td><td>1-10</td><td>9.68</td></tr></table>

Table A3. Formal paired comparison of model performance across 50 Monte Carlo splits.

<table><tr><td>Target</td><td>Metric</td><td>Omnibus Friedman p</td><td>TabPFN vs. RF</td><td>TabPFN vs. XGBoost</td><td>TabICLv2 vs. RF</td><td>TabICLv2 vs. XGBoost</td></tr><tr><td rowspan="5">MS</td><td>RMSE↓</td><td> $2 . 3 1 \times 1 0 ^ { - 1 0 }$ </td><td> $8 . 4 8 \times 1 0 ^ { - 5 \; * }$   $( \mathrm { T a b P F N } )$ </td><td> $1 . 5 2 \times 1 0 ^ { - 5 } \: ^ { \ast }$   $( \mathrm { T a b P F N } )$ </td><td> $1 . 8 0 \times 1 0 ^ { - 1 0 } \: ^ { \ast }$   $( \mathrm { T a b I C L v 2 } )$ </td><td> $1 . 1 7 \times 1 0 ^ { - 8 } \; ^ { \ast }$   $( \mathrm { T a b I C L v } 2 )$ </td></tr><tr><td>MAPE (%) ↓</td><td> $5 . 5 9 \times 1 0 ^ { - 2 1 }$ </td><td> $6 . 2 2 \times 1 0 ^ { - 1 3 \; * }$   $( \mathrm { T a b P F N } )$ </td><td> $9 . 4 0 \times 1 0 ^ { - 1 0 \; * }$   $( \mathrm { T a b P F N } )$ </td><td> $1 . 0 7 \times 1 0 ^ { - 1 4 \; * }$   $( \mathrm { T a b I C L v 2 } )$ </td><td> $2 . 1 8 \times 1 0 ^ { - 1 2 } \: ^ { * }$   $( \mathrm { T a b I C L v } 2 )$ </td></tr><tr><td>MAE↓</td><td> $1 . 5 7 \times 1 0 ^ { - 1 9 }$ </td><td> $2 . 9 4 \times 1 0 ^ { - 9 } \; ^ { \ast }$   $( \mathrm { T a b P F N } )$ </td><td> $1 . 5 5 \times 1 0 ^ { - 9 } \: ^ { \ast }$   $( \mathrm { T a b P F N } )$ </td><td> $1 . 0 7 \times 1 0 ^ { - 1 4 \; * }$   $( \mathrm { T a b I C L v 2 } )$ </td><td> $1 . 7 8 \times 1 0 ^ { - 1 4 } \: ^ { \ast }$   $( \mathrm { T a b I C L v } 2 )$ </td></tr><tr><td> $R ^{2} 个$ </td><td> $2 . 3 1 \times 1 0 ^ { - 1 0 }$ </td><td> $1 . 4 6 \times 1 0 ^ { - 4 } \; ^ { \ast }$ </td><td> $3 . 1 8 \times 1 0 ^ { - 5 } \; ^ { \ast }$ </td><td> $2 . 9 8 \times 1 0 ^ { - 1 0 } \: *$ </td><td> $1 . 8 5 \times 1 0 ^ { - 8 } \: ^ { \ast }$ </td></tr><tr><td>MAD↓</td><td> $1 . 8 9 \times 1 0 ^ { - 1 4 }$ </td><td> $( \mathrm { T a b P F N } )$   $5 . 7 9 \times 1 0 ^ { - 8 } \: ^ { \ast }$ </td><td> $( \mathrm { T a b P F N } )$   $8 . 5 0 \times 1 0 ^ { - 6 } \: ^ { \ast }$ </td><td> $( \mathrm { T a b I C L v 2 } )$   $1 . 3 4 \times 1 0 ^ { - 1 1 \; * }$ </td><td> $( \mathrm { T a b I C L v } 2 )$   $7 . 4 4 \times 1 0 ^ { - 6 } \: ^ { * }$  (TabICLv2)</td></tr><tr><td rowspan="5">ITS</td><td>RMSE↓</td><td> $2 . 9 3 \times 1 0 ^ { - 7 }$ </td><td> $( \mathrm { T a b P F N } )$   $5 . 4 3 \times 1 0 ^ { - 7 } \: ^ { \ast }$ </td><td>(TabPFN)  $1 . 3 2 \times 1 0 ^ { - 4 } \; ^ { \ast }$ </td><td> $( \mathrm { T a b I C L v 2 } )$   $4 . 9 9 \times 1 0 ^ { - 6 } \; ^ { \ast }$ </td><td> $2 . 7 1 \times 1 0 ^ { - 4 \; * }$ </td></tr><tr><td>MAPE (%) ↓</td><td> $5 . 8 3 \times 1 0 ^ { - 2 7 }$ </td><td> $( \mathrm { T a b P F N } )$   $1 . 0 7 \times 1 0 ^ { - 1 4 \; * }$ </td><td> $( \mathrm { T a b P F N } )$   $1 . 7 8 \times 1 0 ^ { - 1 4 \; * }$   $( \mathrm { T a b P F N } )$ </td><td> $( \mathrm { T a b I C L v 2 } )$   $1 . 7 8 \times 1 0 ^ { - 1 4 \; * }$ </td><td> $( \mathrm { T a b I C L v } 2 )$   $1 . 0 1 \times 1 0 ^ { - 1 3 } \: ^ { \ast }$ </td></tr><tr><td>MAE↓</td><td> $9 . 3 3 \times 1 0 ^ { - 2 4 }$ </td><td> $( \mathrm { T a b P F N } )$   $1 . 0 7 \times 1 0 ^ { - 1 4 \; * }$ </td><td> $3 . 0 6 \times 1 0 ^ { - 1 3 \; * }$ </td><td> $( \mathrm { T a b I C L v 2 } )$   $4 . 4 4 \times 1 0 ^ { - 1 4 \; * }$ </td><td> $( \mathrm { T a b I C L v } 2 )$   $7 . 3 0 \times 1 0 ^ { - 1 3 } \: *$ </td></tr><tr><td> $R ^{2} 个$ </td><td> $2 . 9 3 \times 1 0 ^ { - 7 }$ </td><td> $( \mathrm { T a b P F N } )$   $1 . 0 5 \times 1 0 ^ { - 5 } \: ^ { \ast }$ </td><td> $( \mathrm { T a b P F N } )$   $5 . 2 1 \times 1 0 ^ { - 4 } \; ^ { \ast }$ </td><td> $( \mathrm { T a b I C L v 2 } )$   $4 . 4 4 \times 1 0 ^ { - 5 } \; ^ { \ast }$ </td><td> $( \mathrm { T a b I C L v } 2 )$   $1 . 6 5 \times 1 0 ^ { - 3 } \: ^ { \ast }$ </td></tr><tr><td> $\operatorname { M A D } \downarrow$ </td><td> $2 . 2 7 \times 1 0 ^ { - 2 0 }$ </td><td> $( \mathrm { T a b P F N } )$   $1 . 0 7 \times 1 0 ^ { - 1 4 \; * }$   $( \mathrm { T a b P F N } )$ </td><td> $( \mathrm { T a b P F N } )$   $8 . 0 9 \times 1 0 ^ { - 1 1 \; * }$   $( \mathrm { T a b P F N } )$ </td><td> $( \mathrm { T a b I C L v 2 } )$   $1 . 2 4 \times 1 0 ^ { - 1 3 } \: ^ { \ast }$   $( \mathrm { T a b I C L v 2 } )$ </td><td> $( \mathrm { T a b I C L v } 2 )$   $1 . 3 1 \times 1 0 ^ { - 1 0 } \: ^ { \ast }$   $( \mathrm { T a b I C L v } 2 )$ </td></tr></table>

Note: Omnibus p-values were obtained using the Friedman test across the four models. Pairwise p-values were obtained using two-sided Wilcoxon signed-rank tests with Holm correction. The model shown in parentheses indicates the better-performing model. \* Adjusted $p < 0 . 0 5$ . Arrows indicate the preferred direction of each metric.

## References

1. Wang, F.; Hoff, I.; Yang, F.; Wu, S.; Xie, J.; Li, N.; Zhang, L. Comparative assessments for environmental impacts from three advanced asphalt pavement construction cases. J. Clean. Prod. 2021, 297, 126659. [[CrossRef](https://doi.org/10.1016/j.jclepro.2021.126659)]

2. AlKheder, S.; AlKandari, D.; AlYatama, S. Sustainable assessment criteria for airport runway material selection: A fuzzy analytical hierarchy approach. Eng. Constr. Archit. Manag. 2022, 29, 3091–3113. [[CrossRef](https://doi.org/10.1108/ECAM-01-2021-0052)]

3. James, W.; Thompson, M.K. Contaminants from four new pervious and impervious pavements in a parking-lot. In Advances in Modeling the Management of Stormwater Impacts; CRC Press: Boca Raton, FL, USA, 2021; pp. 207–222. [[CrossRef](https://doi.org/10.1201/9781003208945-11)]

4. Ning, Z.; Sun, Z.; Liu, Y.; Dong, J.; Meng, X.; Wang, Q.; Wei, Y. Evaluating the impervious performance of hydraulic asphalt concrete in embankment dams: A study of crack evolution at different temperatures. Constr. Build. Mater. 2024, 440, 137247. [[CrossRef](https://doi.org/10.1016/j.conbuildmat.2024.137247)]

5. Bieliatynskyi, A.; Yang, S.; Pershakov, V.; Shao, M.; Ta, M. Features of the hot recycling method used to repair asphalt concrete pavements. Mater. Sci. Pol. 2022, 40, 181–195. [[CrossRef](https://doi.org/10.2478/msp-2022-0021)]

6. Yao, H.; Wang, Y.; Ma, P.; Li, X.; You, Z. A literature review: Asphalt pavement repair technologies and materials. Proc. Inst. Civ. Eng. Eng. Sustain. 2023, 177, 259–273. [[CrossRef](https://doi.org/10.1680/jensu.22.10000)]

7. Rivera-Perez, J.; Talebpour, A.; Al-Qadi, I.L. Prediction of asphalt concrete flexibility index and rut depth utilising deep learning and Monte Carlo Dropout simulation. Int. J. Pavement Eng. 2023, 24, 2253964. [[CrossRef](https://doi.org/10.1080/10298436.2023.2253964)]

8. Ma, R.; Li, Y.; Cheng, P.; Chen, X.; Cheng, A. Low-temperature cracking and improvement methods for asphalt pavement in cold regions: A review. Buildings 2024, 14, 3802. [[CrossRef](https://doi.org/10.3390/buildings14123802)]

9. Al-Atroush, M.E. Structural behavior of the geothermo-electrical asphalt pavement: A critical review concerning climate change. Heliyon 2022, 8, e12107. [[CrossRef](https://doi.org/10.1016/j.heliyon.2022.e12107)] [[PubMed](https://www.ncbi.nlm.nih.gov/pubmed/36544832)]

10. Arabzadeh, A.; Ceylan, H.; Kim, S.; Gopalakrishnan, K.; Sassani, A. Superhydrophobic coatings on asphalt concrete surfaces: Toward smart solutions for winter pavement maintenance. Transp. Res. Rec. 2016, 2551, 10–17. [[CrossRef](https://doi.org/10.3141/2551-02)]

11. ASTM D6927-15; Standard Test Method for Marshall Stability and Flow of Asphalt Mixtures. ASTM International: West Conshohocken, PA, USA, 2015. [[CrossRef](https://doi.org/10.1520/D6927-15)]

12. ASTM D6931-17; Standard Test Method for Indirect Tensile (IDT) Strength of Asphalt Mixtures. ASTM International: West Conshohocken, PA, USA, 2017. [[CrossRef](https://doi.org/10.1520/D6931-17)]

13. Dias, J.F.; Picado-Santos, L.G.; Capitao, S.D. Mechanical performance of dry process fine crumb rubber asphalt mixtures placed on the Portuguese road network. Constr. Build. Mater. 2014, 73, 247–254. [[CrossRef](https://doi.org/10.1016/j.conbuildmat.2014.09.110)]

14. Zaumanis, M.; Mallick, R.B.; Frank, R. 100% hot mix asphalt recycling: Challenges and benefits. Transp. Res. Procedia 2016, 14, 3493–3502. [[CrossRef](https://doi.org/10.1016/j.trpro.2016.05.315)]

15. Liu, Q.T.; Wu, S.P. Effects of steel wool distribution on properties of porous asphalt concrete. Key Eng. Mater. 2014, 599, 150–154. [[CrossRef](https://doi.org/10.4028/www.scientific.net/KEM.599.150)]

16. Garcia, A.; Norambuena-Contreras, J.; Bueno, M.; Partl, M.N. Influence of steel wool fibers on the mechanical, termal, and healing properties of dense asphalt concrete. J. Test. Eval. 2014, 42, 1107–1118. [[CrossRef](https://doi.org/10.1520/JTE20130197)]

17. Pasandin, A.R.; Perez, I. Overview of bituminous mixtures made with recycled concrete aggregates. Constr. Build. Mater. 2015, 74, 151–161. [[CrossRef](https://doi.org/10.1016/j.conbuildmat.2014.10.035)]

18. Asi, I.; Alhadidi, Y.I.; Alhadidi, T.I. Predicting Marshall stability and flow parameters in asphalt pavements using explainable machine-learning models. Transp. Eng. 2024, 18, 100282. [[CrossRef](https://doi.org/10.1016/j.treng.2024.100282)]

19. Awan, H.H.; Hussain, A.; Javed, M.F.; Qiu, Y.; Alrowais, R.; Mohamed, A.M.; Fathi, D.; Alzahrani, A.M. Predicting Marshall flow and Marshall stability of asphalt pavements using multi expression programming. Buildings 2022, 12, 314. [[CrossRef](https://doi.org/10.3390/buildings12030314)]

20. Rahman, S.; Bhasin, A.; Smit, A. Exploring the use of machine learning to predict metrics related to asphalt mixture performance. Constr. Build. Mater. 2021, 295, 123585. [[CrossRef](https://doi.org/10.1016/j.conbuildmat.2021.123585)]

21. Liu, J.; Liu, F.; Wang, L. Acceleration of superpave mix design: Solving multi-objective optimization problems using machine learning and the non-dominated sorting genetic Algorithm-II. Transp. Res. Rec. 2024, 2678, 1863–1886. [[CrossRef](https://doi.org/10.1177/03611981241246782)]

22. Zhang, J.; Huang, Y.; Wang, Y.; Ma, G. Multi-objective optimization of concrete mixture proportions using machine learning and metaheuristic algorithms. Constr. Build. Mater. 2020, 253, 119208. [[CrossRef](https://doi.org/10.1016/j.conbuildmat.2020.119208)]

23. Guo, P.; Meng, W.; Xu, M.; Li, V.C.; Bao, Y. Predicting mechanical properties of high-performance fiber-reinforced cementitious composites by integrating micromechanics and machine learning. Materials 2021, 14, 3143. [[CrossRef](https://doi.org/10.3390/ma14123143)] [[PubMed](https://www.ncbi.nlm.nih.gov/pubmed/34201068)]

24. Guo, P.; Meng, W.; Bao, Y. Knowledge-guided data-driven design of ultra-high-performance geopolymer (UHPG). Cem. Concr. Compos. 2024, 153, 105723. [[CrossRef](https://doi.org/10.1016/j.cemconcomp.2024.105723)]

25. Tan, X.; Xing, J.; Wang, Y.; Qiu, H.; Mahjoubi, S.; Guo, P. Explainable machine learning for predicting compressive strength of rubberized concrete: SHAP interpretation, lifecycle assessment, and design recommendations. J. Clean. Prod. 2026, 538, 147338. [[CrossRef](https://doi.org/10.1016/j.jclepro.2025.147338)]

26. Tan, X.; Xing, J.; Mahjoubi, S.; Guo, P.; Wei, Z.; Wang, Y.; Ren, J.; Ai, L.; Meng, W.; Bao, Y. Explainable machine learning and life cycle assessment for sustainable design of fiber-reinforced asphalt concrete. J. Clean. Prod. 2026, 547, 147759. [[CrossRef](https://doi.org/10.1016/j.jclepro.2026.147759)]

27. Xing, J.; Tan, X.; Li, Y.; Jin, D.; Guo, P.; Wang, Y.; Niu, H. Interpretable machine learning for predicting splitting strength of asphalt concrete: Insights from SHAP analysis. Materials 2026, 19, 1636. [[CrossRef](https://doi.org/10.3390/ma19081636)] [[PubMed](https://www.ncbi.nlm.nih.gov/pubmed/42073802)]

28. Probst, P.; Boulesteix, A.L.; Bischl, B. Tunability: Importance of hyperparameters of machine learning algorithms. J. Mach. Learn. Res. 2019, 20, 1–32. [[CrossRef](https://doi.org/10.1109/icscc.2019.8843676)]

29. Zahoor, M.F.; Hussain, A.; Khattak, A. Machine learning-based prediction performance comparison of Marshall Stability and flow in asphalt mixtures. Infrastructures 2025, 10, 142. [[CrossRef](https://doi.org/10.3390/infrastructures10060142)]

30. Hollmann, N.; Muller, S.; Purucker, L.; Krishnakumar, A.; Korfer, M.; Hoo, S.B.; Schirrmeister, R.T.; Hutter, F. Accurate predictions on small data with a tabular foundation model. Nature 2025, 637, 319–326. [[CrossRef](https://doi.org/10.1038/s41586-024-08328-6)] [[PubMed](https://www.ncbi.nlm.nih.gov/pubmed/39780007)]

31. Qu, J.; Holzmuller, D.; Varoquaux, G.; Morvan, M.L. TabICLv2: A better, faster, scalable, and open tabular foundation model. arXiv 2026, arXiv:2602.11139. [[CrossRef](https://doi.org/10.48550/arXiv.2602.11139)]

32. Abd, N.I.; Latief, R.H. The effects of fibers on the properties of local hot asphalt mixtures. Tikrit J. Eng. Sci. 2024, 31, 146–157. [[CrossRef](https://doi.org/10.25130/tjes.31.4.15)]

33. Aboutalebi Esfahani, M.; Namavar Jahromi, M. Optimum parafibre length according to mechanical properties in hot mix asphalt. Road Mater. Pavement Des. 2020, 21, 683–700. [[CrossRef](https://doi.org/10.1080/14680629.2018.1527240)]

34. Ai, C. Characteristics and Design Methods of Asphalt Pavement in Plateau-Cold Region. Ph.D. Thesis, Southwest Jiaotong University, Chengdu, China, 2008. Available online: [https://cdmd.cnki.com.cn/Article/CDMD-10613-2008177745.htm](https://cdmd.cnki.com.cn/Article/CDMD-10613-2008177745.htm) (accessed on 30 June 2026).

35. Al-Ridha, A.S.; Alkaissi, Z.A.; Kareem, S.M. Evaluating the influence of adding steel fibers on the moisture damage and aging resistance of hot asphalt mixtures. Mater. Today Proc. 2021, 47, 2520–2528. [[CrossRef](https://doi.org/10.1016/j.matpr.2021.05.046)]

36. Al-Ridha, A.S.; Ibrahim, S.K.; Dheyab, E.L.S. Steel fiber effect on the behavior of hot mixture asphalt with variable asphalt content. Int. J. Adv. Technol. Eng. Sci. 2016, 4, 204–213. Available online: [https://www.researchgate.net/publication/329586636](https://www.researchgate.net/publication/329586636) (accessed on 30 June 2026).

37. Al-Saadi, A.A.; Ismael, M.Q. Improvement of moisture susceptibility for asphalt mixture with ceramic fiber. J. Eng. 2023, 29, 78–91. [[CrossRef](https://doi.org/10.31026/j.eng.2023.04.05)]

38. Ali, S.; Siddiqui, M.O.R.; Ahmed, A.; Iqbal, K.; Noorani, M.U.; Sun, D.; Iqbal, W. Performance evaluation of hot mix asphalt using textile waste. Ind. Text. 2022, 73, 225–232. [[CrossRef](https://doi.org/10.35530/IT.073.03.202144)]

39. Aljubory, A.; Teama, Z.T.; Salman, H.T.; Abd Alkareem, H.M. Effects of cellulose fibers on the properties of asphalt mixtures. Mater. Today Proc. 2021, 42, 2941–2947. [[CrossRef](https://doi.org/10.1016/j.matpr.2020.12.772)]

40. Burak, S.; Ali, T. Use of asphalt roofing shingle waste in HMA. Constr. Build. Mater. 2005, 19, 337–346. [[CrossRef](https://doi.org/10.1016/j.conbuildmat.2004.08.005)]

41. Chen, F.; Xue, J.; Yang, Z.; Gao, K.; Huo, Z. Influence of wood fiber on the laboratory road performance of recycled asphalt pavement (RAP) asphalt mixture. IOP Conf. Ser. Mater. Sci. Eng. 2020, 772, 012025. [[CrossRef](https://doi.org/10.1088/1757-899X/772/1/012025)]

42. Chen, Z.; Chen, Z.; Yi, J.; Feng, D. Preparation method of corn stalk fiber material and its performance investigation in asphalt concrete. Sustainability 2019, 11, 4050. [[CrossRef](https://doi.org/10.3390/su11154050)]

43. Chen, M. Research on Snow Melting and Solar Energy Collection for Thermal Conductive Asphalt Pavement. Ph.D. Thesis, Wuhan University of Technology, Wuhan, China, 2012. Available online: [https://cdmd.cnki.com.cn/Article/CDMD-10497-1012442416.htm](https://cdmd.cnki.com.cn/Article/CDMD-10497-1012442416.htm) (accessed on 30 June 2026).

44. Cheng, Y.; Li, L.; Zhou, P.; Zhang, Y.; Liu, H. Multi-objective optimization design and test of compound diatomite and basalt fiber asphalt mixture. Materials 2019, 12, 1461. [[CrossRef](https://doi.org/10.3390/ma12091461)] [[PubMed](https://www.ncbi.nlm.nih.gov/pubmed/31064147)]

45. Dalhat, M.A.; Osman, S.A.; Alhuraish, A.A.A.; Almarshad, F.K.; Qarwan, S.A.; Adesina, A.Y. Chicken feather fiber modified hot mix asphalt concrete: Rutting performance, durability, mechanical and volumetric properties. Constr. Build. Mater. 2020, 239, 117849. [[CrossRef](https://doi.org/10.1016/j.conbuildmat.2019.117849)]

46. Esfandiarpour, S. Hybrid Reinforcement of Asphalt-Concrete Mixtures Using Glass and Polypropylene Fibers. Ph.D, Thesis, Eastern Mediterranean University, Famagusta, Cyprus, 2010. Available online: [http://hdl.handle.net/11129/149](http://hdl.handle.net/11129/149) (accessed on 30 June 2026).

47. Fan, T.; Si, C.; Zhang, Y.; Zhu, Y.; Li, S. Optimization design of asphalt mixture composite reinforced with calcium sulfate anhydrous whisker and polyester fiber based on response surface methodology. Materials 2023, 16, 594. [[CrossRef](https://doi.org/10.3390/ma16020594)] [[PubMed](https://www.ncbi.nlm.nih.gov/pubmed/36676331)]

48. Fan, T. Study on Performance of Calcium Sulfate Whisker-Polyester Fiber Compound Modified Asphalt and Asphalt Mixture. Ph.D. Thesis, Changan University, Xi’an, China, 2020. [[CrossRef](https://doi.org/10.26976/d.cnki.gchau.2020.000034)]

49. Gui-juan, Z. Test on evaluation index of deformation performance for polyester fiber reinforced asphalt concrete. In Proceedings of the 2010 International Conference on Intelligent System Design and Engineering Application, Changsha, China, 13–14 October 2010; IEEE: Piscataway, NJ, USA, 2010; Volume 2, pp. 561–564. [[CrossRef](https://doi.org/10.1109/ISDEA.2010.61)]

50. He, Y.; Zhang, J.; Zhao, X.; Wang, M.; Xiong, K.; Hu, Q. Study on design optimization, road performance verification and preparation process selection of hybrid fiber reinforced asphalt mixture composite. Constr. Build. Mater. 2024, 448, 138245. [[CrossRef](https://doi.org/10.1016/j.conbuildmat.2024.138245)]

51. Hidayat, N.; Pratama, G.N.I.P.; Pramita, I.D. The effect of PET plastic addition (polyethylene terephthalate) and carbide waste filler for asphalt concrete-binder course (AC-BC) on Marshall characteristics. IOP Conf. Ser. Earth Environ. Sci. 2019, 366, 012024. [[CrossRef](https://doi.org/10.1088/1755-1315/366/1/012024)]

52. Hussein, F.K.; Ismael, M.Q.; Huseien, G.F. Rock wool fiber-reinforced and recycled concrete aggregate-imbued hot asphalt mixtures: Design and moisture susceptibility evaluation. J. Compos. Sci. 2023, 7, 428. [[CrossRef](https://doi.org/10.3390/jcs7100428)]

53. Kim, M.J.; Kim, S.; Yoo, D.Y.; Shin, H.O. Enhancing mechanical properties of asphalt concrete using synthetic fibers. Constr. Build. Mater. 2018, 178, 233–243. [[CrossRef](https://doi.org/10.1016/j.conbuildmat.2018.05.070)]

54. Kumar, P.; Mehndiratta, H.C.; Immadi, S. Investigation of fiber-modified bituminous mixes. Transp. Res. Rec. 2009, 2126, 91–99. [[CrossRef](https://doi.org/10.3141/2126-11)]

55. Li, C. Study on the Self-Healing Performance and Mechanism of Asphalt Concrete Under Microwave Radiation. Ph.D. Thesis, Wuhan University of Technology, Wuhan, China, 2020. [[CrossRef](https://doi.org/10.27381/d.cnki.gwlgu.2020.000075)]

56. Li, H.; Liang, D.; Xiao, Z.; Chen, M.; Zhao, W. Performance characterization of steel slag powder and its effect on the water stability of asphalt concrete. J. Wuhan Univ. Technol. Transp. Sci. Eng. 2020, 44, 536–540.

57. Liu, F.; Dong, A.; Liu, C.; Wu, W. Mix design of asphalt mixture used for the waterproof and anti-cracking layer in the rainy area of South China. J. Appl. Biomater. Funct. Mater. 2018, 16, 112–118. [[CrossRef](https://doi.org/10.1177/2280800017753052)] [[PubMed](https://www.ncbi.nlm.nih.gov/pubmed/29618260)]

58. Liu, X.; Yu, X.M.; Xu, C.; Chu, J.W. The research of durability of asphalt concrete bridge deck with little polyester fiber content in cold regions. Key Eng. Mater. 2020, 852, 41–48. [[CrossRef](https://doi.org/10.4028/www.scientific.net/KEM.852.41)]

59. Ma, Z. Design and Application Research of Electrically Heated Ice and Snow Melting Paving Structure Based on Conductive Rubber Composite Material. Ph.D. Thesis, Jilin University, Changchun, China, 2024. [[CrossRef](https://doi.org/10.27162/d.cnki.gjlin.2024.000312)]

60. Mawat, H.Q.; Ismael, M.Q. Assessment of moisture susceptibility for asphalt mixtures modified by carbon fibers. Civ. Eng. J. 2020, 6, 304–317. [[CrossRef](https://doi.org/10.28991/cej-2020-03091472)]

61. Miera-Dominguez, H.; Lastra-Gonzalez, P.; Indacoechea-Vega, I.; Castro-Fresno, D. Evaluation of the mechanical performance of AC mixtures with recycled fibres. Dev. Built Environ. 2024, 18, 100435. [[CrossRef](https://doi.org/10.1016/j.dibe.2024.100435)]

62. Moussa, G.K.; Gomaa, K. Effect of addition of short fibers of poly-acrylic and polyamide to asphalt mixtures. Alex. Eng. J. 2003, 42, 329–336.

63. Pratul, R.; Satish, K.; Kumar, S.A. Experimental study on fiber reinforced bituminous concrete. Mater. Today Proc. 2021, 46, 11077–11083. [[CrossRef](https://doi.org/10.1016/j.matpr.2021.02.227)]

64. Qin, L. Study on the effects of aging on the volume and water stability properties of steel slag and its asphalt concrete. J. China Foreign Highw. 2019, 39, 264–270. [[CrossRef](https://doi.org/10.14048/j.issn.1671-2579.2019.06.056)]

65. Shanbara, H.K. Effect of carbon fiber on the performance of reinforced asphalt concrete mixture. Muthanna J. Eng. Technol. 2011, 1, 39–51. [[CrossRef](https://doi.org/10.52113/3/eng/mjet/2011-01-01/40-52)]

66. Shu, J.; Xv, K.; Liu, S.; Wan, P.; Liu, Q.; Wu, S. Effects of calcium alginate/Fe3O4 composite self-healing capsules on road performance of asphalt concrete. J. Wuhan Univ. Technol. Transp. Sci. Eng. 2025, 1–17. Available online: [https://link.cnki.net/urlid/42.1824.U.20250325.1426.002](https://link.cnki.net/urlid/42.1824.U.20250325.1426.002) (accessed on 30 June 2026).

67. Singh, S.; Khairandish, M.I.; Razahi, M.M.; Kumar, R.; Chohan, J.S.; Tiwary, A.; Sharma, S.; Li, C.; Ilyas, R.A.; Asyraf, M.R.M.; et al. Preference index of sustainable natural fibers in stone matrix asphalt mixture using waste marble. Materials 2022, 15, 2729. [[CrossRef](https://doi.org/10.3390/ma15082729)] [[PubMed](https://www.ncbi.nlm.nih.gov/pubmed/35454422)]

68. Slebi-Acevedo, C.J.; Lastra-Gonzalez, P.; Castro-Fresno, D.; Vega-Zamanillo, A. Experimental evaluation and recyclability potential of asphalt concrete mixtures with polyacrylonitrile fibers. Constr. Build. Mater. 2022, 317, 125829. [[CrossRef](https://doi.org/10.1016/j.conbuildmat.2021.125829)]

69. Tu, Y.; Chen, G.; Cheng, Z.; Cheng, S. Effect of nano-SiO<sub>2</sub> on properties of recycled aggregate asphalt mixture. Mater. Rep. 2022, 36, 220–224.

70. Wang, X.; Zhou, H.; Hu, X.; Shen, S.; Dong, B. Investigation of the performance of ceramic fiber modified asphalt mixture. Adv. Civ. Eng. 2021, 2021, 8833468. [[CrossRef](https://doi.org/10.1155/2021/8833468)]

71. Wu, C.; Li, L.; Cheng, Y.; Gu, Z.; Lv, Z.; Wang, R.; Guan, B. Effect of diatomite and basalt fibers on pavement performance and vibration attenuation of waste tires rubber-modified asphalt mixtures. Math. Probl. Eng. 2020, 2020, 8853428. [[CrossRef](https://doi.org/10.1155/2020/8853428)]

72. Yin, J.; Wu, W. Utilization of waste nylon wire in stone matrix asphalt mixtures. Waste Manag. 2018, 78, 948–954. [[CrossRef](https://doi.org/10.1016/j.wasman.2018.06.055)] [[PubMed](https://www.ncbi.nlm.nih.gov/pubmed/32559991)]

73. Zhao, S.Q. Study on short carbon fiber asphalt concrete Marshall. Adv. Mater. Res. 2012, 529, 446–449. [[CrossRef](https://doi.org/10.4028/www.scientific.net/AMR.529.446)]

74. Paraskevas, K.; Christos, T. Data preprocessing and feature engineering for data mining: Techniques, tools, and best practices. AI 2025, 6, 257. [[CrossRef](https://doi.org/10.3390/ai6100257)]

75. Breiman, L. Random forests. Mach. Learn. 2001, 45, 5–32. [[CrossRef](https://doi.org/10.1023/A:1010933404324)]

76. Chen, T.; Guestrin, C. XGBoost: A scalable tree boosting system. In Proceedings of the 22nd ACM SIGKDD International Conference on Knowledge Discovery and Data Mining, San Francisco, CA, USA, 13–17 August 2016; Association for Computing Machinery: New York, NY, USA, 2016; pp. 785–794. [[CrossRef](https://doi.org/10.1145/2939672.2939785)]

77. Akiba, T.; Sano, S.; Yanase, T.; Ohta, T.; Koyama, M. Optuna: A next-generation hyperparameter optimization framework. In Proceedings of the 25th ACM SIGKDD International Conference on Knowledge Discovery and Data Mining, Anchorage, AK, USA, 4–8 August 2019; pp. 2623–2631. [[CrossRef](https://doi.org/10.1145/3292500.3330701)]

78. Deb, K.; Pratap, A.; Agarwal, S.; Meyarivan, T. A fast and elitist multiobjective genetic algorithm: NSGA-II. IEEE Trans. Evol. Comput. 2002, 6, 182–197. [[CrossRef](https://doi.org/10.1109/4235.996017)]

79. Hwang, C.-L.; Yoon, K. Multiple Attribute Decision Making: Methods and Applications: A State-of-the-Art Survey; Springer: Berlin/Heidelberg, Germany, 1981. [[CrossRef](https://doi.org/10.1007/978-3-642-48318-9)]

80. Behzadian, M.; Otaghsara, S.K.; Yazdani, M.; Ignatius, J. A state-of-the-art survey of TOPSIS applications. Expert Syst. Appl. 2012, 39, 13051–13069. [[CrossRef](https://doi.org/10.1016/j.eswa.2012.05.056)]

81. Lundberg, S.M.; Lee, S.I. A unified approach to interpreting model predictions. Adv. Neural Inf. Process. Syst. 2017, 30, 4768–4777. [[CrossRef](https://doi.org/10.48550/arXiv.1705.07874)]

**Disclaimer/Publisher’s Note:** The statements, opinions and data contained in all publications are solely those of the individual author(s) and contributor(s) and not of MDPI and/or the editor(s). MDPI and/or the editor(s) disclaim responsibility for any injury to people or property resulting from any ideas, methods, instructions or products referred to in the content.