<!--
SOURCE: 原始 PDF: reference/材料-性能关系/2025-Advanced Engineering Informatics-Enhancing understanding of asphalt mixture dynamic modulus prediction through interpretable machine learning method.pdf | 页数: 14 | 集合: reference
题录: litfull-090 Enhancing understanding of asphalt mixture dynamic modulus prediction through interpretable machine learning method (DOI: 10.1016/j.aei.2025.103111)
提取: MinerU markdown 全文（可重建索引的真相源副本；images/ 不入 corpus）
-->

Full length article

![](images/page_0_image_8.jpg)

# Enhancing understanding of asphalt mixture dynamic modulus prediction through interpretable machine learning method

Ke Zhang a,c , Zhaohui Min a,\*, Xiatong Hao b, Theunis F.P. Henning c, Wei Huang a

a Intelligent Transportation System Research Center, Southeast University, Southeast University Road #2, Nanjing 211189, China

b School of Transportation, Southeast University, Southeast University Road #2, Nanjing 211189, China

c Department of Civil and Environmental Engineering, University of Auckland, Auckland 1142, New Zealand

## A R T I C L E I N F O

Keywords: Dynamic modulus of asphalt mixture Extreme Gradient Boosting Whale Optimization Algorithm Influencing factors Shapley Additive Explanations analysis Partial Dependence Plot analysis

## A B S T R A C T

Dynamic modulus is a key parameter in pavement design and pavement mechanics analysis. It is essential to accurately predict dynamic modulus and study the relationships between influencing factors and dynamic modulus. In this study, a hybrid prediction model is developed based on Extreme Gradient Boosting (XGBoost) and Whale Optimization Algorithm (WOA). Based on this model, the effects of asphalt binder properties, test condition, asphalt mixture volume parameters, and asphalt mixture gradation on dynamic modulus are analyzed. The contribution of each variable to the model predictions is quantified through Shapley Additive Explanations (SHAP), and the interaction between dynamic modulus and influencing factors is evaluated by Partial Dependence Plot (PDP). The results indicate that the WOA-XGBoost model has excellent accuracy and robustness in predicting dynamic modulus. The three most important factors affecting dynamic modulus prediction results are the complex shear modulus of binder, the test temperature and the asphalt binder viscosity. The increase in dynamic modulus can be achieved through the utilization of asphalt binders characterized by relatively large complex modulus, high viscosity, small phase angle, and high asphalt PG indexes. Reducing the effective binder volume and air voids of the mixture, optimizing the mixture gradation to a suitable level, and increasing the mineral powder content can also lead to the increase of dynamic modulus. Besides, low test temperature and high frequency generally mean a large value of dynamic modulus. This study clarifies the impact of influencing factors on the performance of asphalt mixtures based on machine learning, which lay a foundation for the intelligent design of asphalt mixtures.

## 1. Introduction

## 1.1. Background and literature review

Dynamic modulus of the asphalt mixture is the ratio of stress to strain under continuous sinusoidal load, which is considered a key parameter in the Mechanics-Empirical Pavement Design Guide (MEPDG) for pre-dicting performance and estimating mechanical response[1,26,13]. Asphalt mixture with high dynamic modulus can exhibit higher resistance to deformation under repeated traffic loads[56]. There are usually two ways to obtain dynamic modulus, laboratory experiments and building prediction models. The latter has lower costs and higher efficiency[40]. However, accurately predicting dynamic modulus still is a critical task in pavement engineering.

Many researchers have contributed to the study of predicting dynamic modulus. Early prediction models are based on regression analysis, such as the Witczak 1-37A model based on asphalt binder viscosity (Witczak et al., 1996), the Witczak 1-40D model based on asphalt binder complex shear modulus[9,10], the Hirsch model based on asphalt binder modulus and mixture volumetric composition[20], the Al-Khateeb model based on asphalt binder complex shear modulus, voids in mineral aggregates and asphalt binder glassy shear modulus[3] and etc. These prediction models each consider different factors, and in addition to these factors asphalt binder phase angle, PG grade of asphalt binder, test condition, effective binder volume, mixture gradation, etc. are also considered to be useful in predicting the dynamic modulus of asphalt mixture [36,19,8,63,29,6,64,14,33]. To sum up, the above-mentioned factors that have significant effects on the dynamic modulus of the mixture should all be considered when proposing prediction models.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">\* Corresponding author.</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">E-mail addresses: [kezhang@seu.edu.cn](mailto:kezhang@seu.edu.cn) (K. Zhang), [minzhaohui@seu.edu.cn](mailto:minzhaohui@seu.edu.cn) (Z. Min), [xthao96@foxmail.com](mailto:xthao96@foxmail.com) (X. Hao), [t.henning@auckland.ac.nz](mailto:t.henning@auckland.ac.nz) (T.F.P. Henning), [hhhwei2005@126.com](mailto:hhhwei2005@126.com) (W. Huang).</span></small>

The early prediction models of dynamic modulus based on regression analysis have limited accuracy. In recent years, many advanced machine learning models have been developed and applied to predict dynamic modulus, achieving satisfactory results, such as Artificial Neural Networks (ANN) [25,11], Support Vector Machine (SVM)[2], Gene Expression Programming (GEP)[39], Extreme Gradient Boosting (XGBoost)[5]. Among them, XGBoost has stronger processing capabilities for outliers and higher prediction accuracy[5,62,66]. However, the hyper-parameter optimization of XGBoost still needs be enhanced, since the selection of hyper-parameter has a great impact on the accuracy of this model. Researchers have found that using metaheuristic algorithms, such as Particle Swarm Optimization (PSO), Whale Optimization Algorithm (WOA), Ant Colony Optimization (ACO), for hyper-parameter optimization can achieve good results[22,45,48]. Specifically, WOA may be an ideal option, since it is often used to capture the best hyperparameters of advanced machine learning models. Such models have shown satisfactory results in many fields, including fake news detection [53], strength prediction of cement material[61], energy use forecast [47].

Despite achieving higher accuracy than early regression models, the machine learning models are inherently poorly interpretable due to their black-box nature [38]. Thus, some researchers do not trust the results of machine learning models. Given such backgroud, Shapley Additive Explanations (SHAP) and Partial Dependency Plot (PDP) are proposed, which can investigate the effects of machine learning model inputs on outcome. SHAP offers a method for explaining the performance of individual predictors by evaluating each feature’s contribution to the prediction results[41]. And Partial Dependency Plot (PDP) provides a clear and interpretable way to understand the complex relationships between features and outcomes by systematically varying the selected features and observing their impact on the model’s predictions[27]. Currently, SHAP and PDP have been applied in many fields, including concrete performance[42,35], pavement performance evaluation[55], air quality control[30], building energy management[18]. In a word, by introducing SHAP and PDP into machine learning model for dynamic modulus prediction, the credibility of the model can be improved and more valuable insights related to the design of asphalt mixtures and pavement structures can be derived, making them more consistent with actual needs.

## 1.2. Study Objectives

This study aims to develop a satisfactory machine learning prediction model for dynamic modulus and to explore the relationship between influencing factors and dynamic modulus based on interpretability analysis. This study will overcome the issues of limited influencing factors in early dynamic modulus prediction models, insufficient parameter optimization in machine learning models for dynamic modulus prediction, and low reliability of machine learning model. Moreover, the derived insights will lay a foundation for intelligent asphalt mixture design, facilitated by the identification of key influencing factors and the recognition of nonlinear relationships.

In this study, asphalt binder properties, test condition, asphalt mixture volume parameters and asphalt mixture gradation, which have been proven to be important factors affecting the dynamic modulus, are taken as model inputs. The WOA-XGBoost model is used to predict dynamic modulus, since previous studies have shown that XGBoost has good prediction performance, and WOA is a effective hyper-parameter optimization algorithm. Moreover, the SHAP and PDP analysis are used to enhance the credibility of the model and explain the relationship between influencing factors and dynamic modulus.

## 2. Machine learning algorithms

## 2.1. Extreme Gradient Boosting (XGBoost)

XGBoost proposed by Chen et al. [17] is a scalable end-to-end tree boosting system that has been widely used in various research fields [37,23,68,60]. By employing a sequential integration technology, it consists of a series of basic regression trees and has adaptive expansion capabilities to enhance its capacity by adding more trees. Since XGBoost is an improved version of the Gradient Boosting Regression Trees (GBRT)[28]that introduces a regularization term into the loss function to penalize model complexity and mitigate the risk of overfittingChen et al. [17], the following equation can be written as:

$$
\mathrm{L} = \sum_{\mathrm{i}} \mathrm{I}(\hat{\mathbf{y}}_{\mathrm{i}}, \mathbf{y}_{\mathrm{i}}) + \sum_{\mathrm{j}} \Omega(\boldsymbol{\theta}_{\mathrm{j}}) = \sum_{\mathrm{i}} \mathrm{I}\left[\hat{\mathbf{y}}_{\mathrm{i}}^{j-1} + \alpha f_{\mathrm{j}}(\mathbf{X}_{\mathrm{i}}, \boldsymbol{\theta}_{\mathrm{j}}), \mathbf{y}_{\mathrm{i}}\right] + \sum_{\mathrm{j}} \Omega(\boldsymbol{\theta}_{\mathrm{j}})\tag{1}
$$

where l is the loss function, usually using the squared error between the predicted value $\widehat { \mathbf { y } }$ and the true value $\mathbf { y } ; \boldsymbol { \theta } _ { \mathbf { j } }$ is the parameter that controls the structure of j-th tree; $\widehat { \mathbf { y } } ^ { \mathrm { j } }$ is the prediction of the j-th regression tree; α is the shrinkage factor or learning rate of individual regression tree; X is the predictor value; $\mathbf { f } _ { \mathrm { j } } ( \mathbf { X } , \boldsymbol { \theta } _ { \mathrm { j } } )$ is the output of the j-th unshrunk regression tree based on the $\theta _ { \mathrm { j } }$ structure, with predictor X and the residual $\mathbf { y }   -   \widehat { \mathbf { y } } ^ { \mathrm { j } - 1 }$ as its inputs.

Ω(θj) is the regularization item on the j-th regression tree, which is used to prevent overfitting, its equation can be written as:

$$
\Omega \left( \Theta _ { j } \right) = \gamma T _ { j } + \frac { 1 } { 2 } \lambda \left\| \boldsymbol { w } _ { k } \right\| = \gamma T _ { j } + \frac { 1 } { 2 } \lambda \sum _ { k = 1 } ^ { T _ { j } } \left[ \boldsymbol { w } _ { k } ^ { ( j ) } \right] ^ { 2 }\tag{2}
$$

where $\gamma$ is the minimum loss reduction required for further node partitioning in the regression tree, $T _ { j }$ is the number of leaves in the j-th regression tree, $\lambda$ is the regularization term for the leaf weight in the regression tree, and $w _ { k } ^ { ( j ) }$ is the weight of the k-th leaf in the j-th regression tree.

## 2.2. Whale optimization algorithm （WOA）

The Whale Optimization Algorithm (WOA) takes inspiration from humpback whales’ bubble-net feeding and attack mechanisms [43]. It comprises three essential components: roundup, net bubble attack, and prey search. The algorithm seeks to find the optimal solution in one or multiple dimensions by modifying its position vector, representing a potential solution. This position or value corresponds to the parameters utilized to solve the problem. The WOA algorithm features a balanced search mechanism that balances exploration and exploitation phases. Here are the detailed steps of the algorithm.

## Step1: Encircling prey

To overcome the difficulty in locating the exact position of prey, the system evaluates the current candidate solution as the target prey. Once the best search agent $( X ^ { \star } , Y ^ { \star } )$ is identified, and the other search agents (X,Y) need to update their locations using Eqs. (3) and (4). Additionally, the algorithm explores the solutions in the vicinity of the best or optimized solution, which are determined using Eqs. (5) and (6).

$$
\mathbf { R } = | \mathbf { C } { \cdot } \mathbf { X } ^ { * } ( \mathbf { t } ) - \mathbf { X } ( \mathbf { t } ) |\tag{3}
$$

$$
\mathbf { X ( t + 1 ) = X ^ { \star } ( t ) - A \cdot } \mathbf { R }\tag{4}
$$

$$
\mathbf { A } = 2 \mathbf { a } \cdot \mathbf { r } _ { 1 } - \mathbf { a }\tag{5}
$$

$$
\mathbf { C } = 2 \mathbf { r } _ { 2 }\tag{6}
$$

where A and C represent the coefficient vectors. The value of parameter a can be reduced from 2 to 0 using equations described in Eq. (7). Factors r1 and r2 are random vectors in the range of [0,1], which makes the value of A obtain $[ - 1 ,   1 ]$ random value in the range. The current position vector of the whale is represented by $\mathbf { X ( t ) } ,$ while the best solution vector of the prey is represented by $\mathbf { X } ^ { \star } ( \mathbf { t } )$ in the t-th iteration.

$$
\mathsf { a } = 2 \times \frac { \mathsf { t } _ { \operatorname* { m a x } } - \mathsf { t } } { \mathsf { t } _ { \operatorname* { m a x } } }\tag{7}
$$

where t and $\mathbf { t _ { m a x } }$ represent the current number and maximum number of iterations, respectively.

## Step 2: Bubble-net attacking method

By implementing two procedures, namely shrinking encircling and spiral updating, the hunting behavior of humpback whales and their bubble-net attacking technique can be mathematically simulated. The spiral equation is expressed as follows:

$$
\mathrm{X}(\mathrm{t}+1)=\mathrm{R}^{\prime} \cdot \mathrm{e}^{\mathrm{bl}} \cos (2 \pi \mathrm{l})+\mathrm{X}^{\ast}(\mathrm{t})\tag{8}
$$

where the shape of the logarithmic spiral is determined by a constant value, denoted by b. Additionally, a random vector, denoted by l, is uniformly distributed within the range of − 1 to 1. The distance between the i-th search agent and the target prey can be calculated using Eqs. (9).

$$
\mathbf { R } ^ { \prime } = | \mathbf { X } ^ { * } ( \mathbf { t } ) - \mathbf { X } ( \mathbf { t } ) |\tag{9}
$$

The behavior of humpback whales, including their shrinking encompassing and spiral updating, can be simulated by assigning an equal probability of selection to both mechanisms during the position updating process. The simulation process can be explained as follows:

$$
\mathbf{X}(\mathbf{t}+\mathbf{1})=\left\{\begin{matrix}\mathbf{X}^{*}(\mathbf{t})-\mathbf{A}\cdot\mathbf{R},p<0.5\\\mathbf{R}^{\prime}\cdot\mathbf{e}^{\mathbf{b}\mathbf{l}}\cos(2\pi\mathbf{l})+\mathbf{X}^{*}(\mathbf{t}),p\geq0.5\end{matrix}\right.\tag{10}
$$

where p is an arbitrary number in the range of [0,1].

Step 3: Search for prey

The equation for updating the whale positions during the exploration phase is presented as follows:

$$
\mathrm { D } = | \mathrm { C } { \cdot } \mathrm { X } _ { \mathrm { r a n d } } ( \mathrm { t } ) - \mathrm { X } |\tag{11}
$$

$$
\mathrm{X}(\mathrm{t}+1)=\mathrm{X}_{\text {rand }}-\mathrm{A} \cdot \mathrm{R}\tag{12}
$$

![](images/page_2_image_18.jpg)

Fig. 1. Flow chart of WOA.

where $\mathbf { X _ { r a n d } }$ denotes the whale location vector which is selected randomly.

Fig. 1 shows the flow chart of WOA, illustrating the key steps and process of algorithm.

## 3. Methodology

This study aims to consider more influencing factors that may affect the dynamic modulus, propose the XGBoost model optimized by WOA to predict dynamic modulus, and analyze the relationship between influencing factors and dynamic modulus on this basis. The influencing factors of the model are divided into four categories: asphalt binder properties, test condition, asphalt mixture volume parameters, and asphalt mixture gradation. The model is built based on the XGBoost and the WOA and has high accuracy and robustness. The model construction process is presented in Section 3.3. The relationship between these four types of variables and dynamic modulus will be analyzed through SHAP and PDP. Fig. 2 illustrates the conceptual framework of this study.

## 3.1. Data source

To establish the predictive model of dynamic modulus and analyze the relationships between influencing factors and dynamic modulus, this study uses part of the data from the National Cooperative Highway Research Program (NCHRP) project 9–19 database, containing 4930 data points covering 153 asphalt mixtures[59]. The influencing factors are divided into four categories, including asphalt binder properties, test conditions, asphalt mixture volumetric parameters, and asphalt mixture gradation. The descriptive statistics of the variables are in Section 4.1.

## 3.2. Data processing

The original dataset contains data with varying scales. In order to avoid prioritizing influencing factors with relatively large values, data processing is conducted to enhance the reliability of prediction outcomes. Logarithmic transformation is performed to deal with influencing factors with large order of magnitude, such as dynamic modulus, asphalt binder viscosity and complex shear modulus. And all the variables need to be normalized, linearly adjusted, and mapped to the range of [-1, 1] to achieve proportional scaling. The normalization mathematical formula is denoted as follows:

$$
\mathrm{mid}(\mathrm{X}) = \frac{\max(\mathrm{X}) + \min(\mathrm{X})}{2}\tag{17}
$$

$$
\mathrm{norm}(\mathrm{X}) = \frac{\mathrm{X} - \mathrm{mid}(\mathrm{X})}{\frac{1}{2}(\max(\mathrm{X}) - \min(\mathrm{X}))}\tag{18}
$$

where norm(X) represents the normalized value; X represents the original value; and mid $( \mathbf { X } ) ,$ , max(X) and min(X) represent the median, maximum, and minimum values of the sample data, respectively.

## 3.3. WOA-XGboost model

Previous research has demonstrated the effectiveness of employing metaheuristic algorithms to optimize the machine learning model’s hyper-parameters, resulting in the most accurate forecast of the asphalt dynamic modulus. This paper employs the Whale Optimization Algorithm (WOA), a metaheuristic optimization technique, to identify the optimal hyper-parameters for the XGBoost model.

Four important hyper-parameters, including learning rate, subsample, maximum tree depth and number of iterations are selected to for optimization. Among them, the learning rate controls the step size of the model parameter update at each iteration, the subsample determines the proportion of samples randomly selected from the training set at each training, the maximum tree depth controls the complexity of each decision tree and the number of iterations determines the number of rounds of model training. Referring to previous studies on the range of hyper-parameter tuning, these hyper-parameters were determined to be tuned with predefined change ranges of [0.01, 1], [0.2, 0.8], [3, 20] and [1000, 5000], respectively [62,57].

![](images/page_3_image_16.jpg)

Fig. 2. Flow chart of the conceptual framework.

During the optimization process, the dataset is randomly divided into two parts: 70 % for training set and 30 % for testing set. The number of iterations of the WOA is set to 100 and the population size of the WOA is set to 10. The iterative process continues until the predefined number of iterations is reached. Moreover, a ten-fold cross-validation method is implemented during training the model. The training set was divided into ten parts, with nine parts for training and one part for validation, and the process was repeated 10 times in total. Table 1 shows the final results of ten-fold cross-validation during training. This method can reduce the influence of random variations and avoid overfitting. After determining the optimal hyper-parameters, the reserved 30 % test set was used for final evaluation to measure the true performance of the prediction model.

## 3.4. Model evaluation

## 3.4.1. Algorithms used for comparison

In this study, the XGBoost was optimized by WOA to predict dynamic modulus. In order to verify the accuracy and robustness of WOA-XGBoost, this model is compared with the basic XGBoost model, whose hyper-parameters are determined by random search, and two improved XGBoost models (named PSO-XGBoost and ACO-XGBoost), whose hyper-parameters are optimized by Particle Swarm Optimization (PSO) and Ant Colony Optimization (ACO) respectively.

• PSO [34]. PSO is a nature-inspired optimization algorithm that mimics the social behavior of birds flocking or fish schooling. In PSO, a set of particles moves around a search space to find the optimal solution. Each particle adjusts its position based on its own experience and the collective experience of the swarm, guided by its own best position and the global best position found by the swarm.

• ACO [24]. ACO is an optimization algorithm inspired by the foraging behavior of ants. Ants communicate by depositing pheromones on trails, enabling others to follow and reinforce optimal routes over time. In ACO, ants explore solutions in a search space, with the attractiveness of paths determined by pheromone strength and heuristic information. The algorithm iteratively updates the pheromone trail to guide the search to find better solutions.

## 3.4.2. Evaluation metrics

The predictive model’s performance for dynamic modulus using four indicators: the coefficient of determination $( \mathbf { R } ^ { 2 } )$ , mean absolute error (MAE), mean absolute percentage error (MAPE), and root mean square error (RMSE). A higher $\mathtt { R } ^ { 2 }$ and lower values for MAE, MAPE, and RMSE indicate a more accurate model. To verify the accuracy of the model, the four indicators of the WOA-XGBoost model after the average of 1000 trials are compared with the XGBoost model. The four indicators are calculated as follows:

Table 1

Results of ten-fold cross-validation.

|  | MAE | MAPE | RMSE | R<sup>2</sup> |
| --- | --- | --- | --- | --- |
| k1 | 0.0257 | 0.0047 | 0.0376 | 0.9971 |
| k2 | 0.0344 | 0.0058 | 0.0414 | 0.9964 |
| k3 | 0.0442 | 0.0080 | 0.0539 | 0.9937 |
| k4 | 0.0338 | 0.0059 | 0.0428 | 0.9963 |
| k5 | 0.0335 | 0.0062 | 0.0443 | 0.9958 |
| k6 | 0.0182 | 0.0032 | 0.0317 | 0.9978 |
| k7 | 0.0262 | 0.0048 | 0.0353 | 0.9974 |
| k8 | 0.0622 | 0.0118 | 0.0796 | 0.9865 |
| k9 | 0.0254 | 0.0046 | 0.0358 | 0.9974 |
| k10 | 0.0129 | 0.0023 | 0.0296 | 0.9981 |
| Average | 0.0317 | 0.0057 | 0.0432 | 0.9957 |

$$
R^{2}=1-\left.\sum_{i = 1}^{n}\left( y _{ i }-\widehat{y}_{ i }\right)^{2}\right/\left.\sum_{i = 1}^{n}\left( y _{ i }-\frac{1}{n}\sum_{i = 1}^{n}y_{ i }\right)^{2}\right.\tag{20}
$$

$$
\mathrm{RMSE} = \sqrt{\frac{1}{\mathrm{n}} \sum_{\mathrm{i}=1}^{\mathrm{n}} \left( \mathrm{y}_{\mathrm{i}} - \widehat{\mathrm{y}}_{\mathrm{i}} \right)^{2}}\tag{21}
$$

$$
\mathrm{MAE} = \frac{1}{\mathrm{n}} \sum_{\mathrm{i}=1}^{\mathrm{n}} \left| \mathrm{y}_{\mathrm{i}} - \widehat{\mathrm{y}}_{\mathrm{i}} \right|\tag{22}
$$

$$
\mathrm{MAPE} = \frac{1}{\mathrm{n}} \sum_{\mathrm{i}=1}^{\mathrm{n}} \left| \frac{y_{\mathrm{i}} - \widehat{y}_{\mathrm{i}}}{y_{\mathrm{i}}} \right|\tag{23}
$$

where $\mathbf { y } _ { \mathrm { i } } , \widehat { \mathbf { y } } _ { \mathrm { i } }$ are the actual and estimated values of sample i, respectively, and n is the number of samples.

## 3.5. Interpretable analysis for prediction model

This study used SHAP, which is based on the concept of Shapley values propsed by Lloyd Shapley[52], to quantify the contribution of each influencing factor to the prediction results of the dynamic modulus model. The Shapley value is to calculate the contributions of each participant in a cooperative game under condition of fair distribution. When the features are viewed as participants in the game, and the model’s outcomes are viewed as the result of the cooperation, the Shapley value can quantify the contribution of each feature to the pre-diction results. Such quantification provide insights into the effects of individual features, thus enhancing transparency and trust in machine learning systems.

And PDP is used to show how changes in a specific feature affect the prediction results. The core idea of PDP is to calculate the influence of a single feature “locally” while keeping other features unchanged “globally” [27]. It generates a graph of the relationship between features and the target variable by calculating the average value of the model output when the feature changes. PDP helps discern whether the relationship between the selected feature and the target variable is linear or non-linear, based on which the direction (positive or negative) of its impact on the model’s predictions can be determined and the potential thresholds can be identified.

## 4. Results and discussion

## 4.1. Descriptive statistics of the dataset

Table 2 presents the calculated statistics for the initial influencing normalized factors used in this study, and Fig. 3 illustrates the distribution of the standardized influencing factors using box and whisker plot. The box and whisker plot includes a box representing the middle 50 % of the data (interquartile range) with a line inside denoting the median, and the whiskers extending from the box that reveal the data’s range. Data points outside the whiskers are considered outliers.

As shown in the table and figure, the data distribution for the percent retained on $3 / 4 ^ { \prime \prime }$ sieve and #200 sieve is skewed towards smaller values, while the data distribution for the percent retained on $3 / 8 ^ { \prime \prime }$ and $\# 4$ is skewed towards larger values. The values of volume parameter variables of asphalt mixtures are relatively centralized, and only a few variables are located outside the whiskers. In terms of asphalt binder properties, significant differences can be observed in viscosity, complex modulus and phase angle. Both PG high temperature and PG low temperature exhibit discrete points due to the fixed classification method used in binder performance evaluation. It needs to be explained is that the binder viscosity in this study is based on the original data of the database and calculated with the viscosity-temperature relationship[7].

Table 2

Description of all variables of the original data.

<table><tr><td colspan="2">Variable</td><td>Mean</td><td>Min</td><td>Max</td><td>S.D.</td></tr><tr><td colspan="2">Asphalt binder properties</td><td></td><td></td><td></td><td></td></tr><tr><td>Asphalt binder viscosity (poise)</td><td>Viscosity</td><td>7.54E + 13</td><td>5.03E + 05</td><td>1.52E + 16</td><td>8.10E + 14</td></tr><tr><td>Complex shear modulus (Pa)</td><td>|G*|</td><td>1129.09</td><td>0.0145</td><td>7386.59</td><td>1499.65</td></tr><tr><td>Phase angle (degree)</td><td> $\delta _ { \mathrm { b } }$ </td><td>57.28</td><td>11.86</td><td>90</td><td>22.37</td></tr><tr><td>PG high temperature (℃)</td><td>PG_H</td><td>64.51</td><td>52</td><td>82</td><td>5.33</td></tr><tr><td>PG low temperature</td><td>PG_L</td><td>-22.04</td><td>-34</td><td>-10</td><td>4.97</td></tr><tr><td>(℃) Test condition</td><td></td><td></td><td></td><td></td><td></td></tr><tr><td>Test temperature (℃)</td><td>T</td><td>70.86</td><td>14</td><td>130</td><td>41.24</td></tr><tr><td>Loading frequency (Hz)</td><td>fc</td><td>6.93</td><td>0.1</td><td>25</td><td>8.78</td></tr><tr><td colspan="2">Asphalt mixture volume parameters</td><td></td><td></td><td></td><td></td></tr><tr><td>Asphalt content (%)</td><td>AC</td><td>5.57</td><td>3.87</td><td>8.9</td><td>1.18</td></tr><tr><td>Specimen air voids (%)</td><td> $\mathrm { V _ { a } }$ </td><td>7.08</td><td>0.7</td><td>18.13</td><td>2.31</td></tr><tr><td>Effective binder volume (%)</td><td>Vbeff</td><td>10.54</td><td>6.08</td><td>25.09</td><td>2.82</td></tr><tr><td>Asphalt mixture gradation</td><td></td><td></td><td></td><td></td><td></td></tr><tr><td>Percent retained on 3/4″ sieve (%)</td><td>ρ34</td><td>3.18</td><td>0</td><td>26.1</td><td>5.31</td></tr><tr><td>Percent retained on 3/8″ sieve (%)</td><td>ρ38</td><td>28.21</td><td>7</td><td>43</td><td>9.04</td></tr><tr><td>Percent retained on #4 sieve (%)</td><td>ρ4</td><td>50.37</td><td>30</td><td>70</td><td>8.35</td></tr><tr><td>Percent passing #200 sieve (%)</td><td>ρ200</td><td>4.99</td><td>2.6</td><td>11.8</td><td>1.48</td></tr><tr><td>Outcome Dynamic modulus</td><td></td><td>1.60E +</td><td>12537.58</td><td>8.64E +</td><td>1.64E +</td></tr><tr><td colspan="2">(psi)</td><td>06</td><td></td><td>06</td><td>06</td></tr></table>

Moreover, it is generally advised to conduct collinearity diagnostics, as the inclusion of variables exhibiting high correlations may result in problematic collinearity[44,50]. In this study, the Spearman correlation coefficients between each variable are chosen as the collinearity indicators, which can measuring the non-linear monotonic relationships between non-normally distributed data [67]. As can be seen from Fig. 4, the results show that the highest absolute value, observed in the correlation coefficient between asphalt binder viscosity and test temperature, is 0.782, which is lower than the criterion of strong correlation (0.8) [49]. These results justify the use of these variables for dynamic modulus prediction.

## 4.2. Performance evaluation of prediction models

This study used WOA to optimize the XGBoost model to accurately predict dynamic modulus. Table 3 shows the average prediction accuracy of WOA-XGBoost and its competitors in 1000 trials, whereas Fig. 5 presents more detailed resuts through box and whisker plot comparsion to evaluate the robustness of these models.

As can be seen in Table $^ { 3 , }$ the XGBoost model serves as the baseline for comparison. After optimizing XGBoost using PSO, its performance has been enhanced. The MAE decreases to 0.0492, the MAPE decreases to 0.0097, the RMSE decreases to 0.0774, and the $\mathtt { R } ^ { 2 }$ increases to 0.9871, which indicates a more accurate model with less error. Further optimization of XGBoost using ACO can achieve better performance. The ACO-XGBoost has a MAE of 0.0449, a MAPE of 0.0081, a RMSE of 0.0723, and a $\mathtt { R } ^ { 2 }$ of 0.9887. Although PSO and ACO enhance the performance of XGBoost, the improvement of WOA is more significant. It provides higher accuracy, lower error rate, and a significantlt better fit to the data. The MAE, MAPE, RMSE and $\mathtt { R } ^ { 2 }$ of WOA-XGBoost reach 0.0329, 0.0060, 0.0446 and 0.9954, respectively.

Fig. 5 offers insights for evaluating model stability. It can be seen that all optimized models exhibit excellent stability in 1000 trials. Specifically, for each evaluation metric, the WOA-XGBoost model has the most compact box and the shortes whisker among all competitors, indicating that this model has least data fluctuation, highest value concentration and most excellent stability. In summary, after optimizing the hyperparameter, the WOA-XGBoost model shows the most satisfactory performance.

## 4.3. Shapley Additive Explanations (SHAP) analysis of the explanatory variables

SHAP analysis based on the proposed dynamic modulus prediction

![](images/page_5_chart_14.jpg)

Fig. 3. Box and whisker plot of normalized explanatory variables.

A Asphalt binder viscosity B Complex shear modulus C Phase angle D PG high temperature E PG low temperature F Test tempearture G Loading frequency H Asphalt content I Specimen air voids J Effective binder volume K Percent retained on $3 / 4 ^ { \prime \prime }$ sieve L Percent retained on $3 / 8 ^ { \prime \prime }$ sieve M Percent retained on #4 sieve N Percent passing #200 sieve O Dynamic modulus

![](images/page_6_chart_2.jpg)

Fig. 4. Spearman coefficient of variables.

Table 3

Prediction accuracy evaluation of the XGBoost model and WOA-XGBoost model.

|  | MAE | MAPE | RMSE | R<sup>2</sup> |
| --- | --- | --- | --- | --- |
| XGBoost | 0.0708 | 0.0126 | 0.1102 | 0.9745 |
| PSO-XGBoost | 0.0492 | 0.0097 | 0.0774 | 0.9871 |
| ACO-XGBoost | 0.0449 | 0.0081 | 0.0723 | 0.9887 |
| WOA-XGBoost | 0.0329 | 0.0060 | 0.0446 | 0.9954 |

model is conducted to investigate each influencing factor’s contribution and predictive ability. The results are shown in Fig. 6.

The complex shear modulus is the most critical factor affecting the prediction of the dynamic modulus of the asphalt mixture. The complex shear modulus reflects the energy storage and dissipation characteristics of the asphalt binder under loading, and the material’s elastic and viscous behavior at different temperatures and frequencies. This property of significantly affects the overall stiffness and deformation resistance of the asphalt mixture. The secondary most important factors are test temperature, binder viscosity, specimen air voids, etc. The complex shear modulus, asphalt binder viscosity, and phase angle play crucial roles as properties of the binder itself, while the influence of the gradation of asphalt mixture is relatively weak. This finding is consistent with the research results of Bi et al. [14], Huang et al. [32] and Chen et al. [16]. The test temperature is also a significant feature since asphalt is temperature sensitive. In addition, loading frequency has an important influence on the dynamic modulus. The frequency-temperature superposition principle is commonly used in dynamic modulus testing. But due to the relatively small variability in the loading frequency of the dataset, the interpretability of the prediction model is limited.

Fig. 7 shows a SHAP summary plot describing the influencing factors used to predict dynamic modulus. Influencing factor names and their respective Shapley values are shown on the y-axis, and the x-axis represents the cumulative density. Feature values are represented by color codes, with lower feature values in blue and higher in red.

As shown in Fig. 7, concerning the effects of the three variables with the greatest influence, lower values of the complex shear modulus reduce the dynamic modulus, while higher values have a significantly positive impact on the dynamic modulus. The test temperature has the opposite effect on the complex shear modulus. The higher the test temperature, the lower the dynamic modulus value. A lower value of asphalt binder viscosity will also reduce the dynamic modulus.

In the case of other variables, a clear positive correlation exists between loading frequency, percentage retained on the #200 sieve, PG low temperature, and dynamic modulus, where an obvious negative correlation between specimen air voids, phase angle and dynamic modulus can be observed. Higher values of percent retained on the 3/8″ and 3/4″ sieves have an adverse effect on the dynamic modulus. And lower values of percent retained on the #4 sieve have a detrimental impact. However, for factors such as asphalt content, effective binder volume, and PG high temperature, their relationship with dynamic modulus necessitates further in-depth research for clarification.

## 4.4. Partial Dependence plot (PDP) analysis of the explanatory variables

PDP offers an intuitive understanding of the interaction between dynamic modulus and the influencing factors, whether exhibiting linear or nonlinear relationships. The x-axis represents the distribution of the data of influencing factors. The y-axis depicts the model’s prediction, and the PDP curve depicts the impact of the influencing factors on the predictions. The shape of the curve can help understand the relationship between features and model output.

(a)

![](images/page_7_chart_3.jpg)

(b)

![](images/page_7_chart_5.jpg)

(c)

![](images/page_7_chart_7.jpg)

(d)

![](images/page_7_chart_9.jpg)

Fig. 5. Box and whisker plot of model evaluation metrics. (a) MAE, (b) MAPE, (c) RMSE, and (d) $\mathtt { R } ^ { 2 }$

## 4.4.1. Asphalt binder properties

4.4.1.1. Asphalt binder stiffness. Fig. 8 presents the effects of asphalt binder stiffness on the dynamic modulus.

From Fig. 8 (a) and (b), it can be seen that there is a positive correlation between asphalt binder viscosity, complex shear modulus, and dynamic modulus. This observation aligns with the research findings of Witczak and Fonseca [58], Bi et al. [14], and Chen et al. [16] Specifically, an increase in viscosity leads to a higher dynamic modulus because high-viscosity asphalt enhances the adhesion and cohesion of the mixture, thereby increasing its stiffness and resistance to deformation. An increase in the complex shear modulus means increasing the material’s stress resistance strength, resulting in an increase in the dynamic modulus value.

Unlike the results of asphalt binder viscosity and complex shear modulus, an overall negative correlation between phase angle and dynamic modulus can be observed. The increasing value of phase angle indicates the increasing proportion of viscous components in the asphalt binder, leading to a higher irrecoverable deformation, and a lower value of dynamic modulus values.

4.4.1.2. Performance grade (PG) of asphalt binder. Fig. 9 shows the effects of the performance grade (PG) of asphalt binder on the dynamic modulus.

PG high temperature and PG low temperature are used to characterize the performance of binders. Fig. 9(a) shows that as the PG high temperature increases, the dynamic modulus value first increases and then decreases. In the relatively low temperature range (58–76), the results of this study are consistent with Behnood and Golafshani [12]. Generally, higher PG high temperature grades are generally associated with larger dynamic modulus, indicating that the material has better high temperature rutting resistance. But as the PG high temperature continues to increase, the dynamic modulus decreases. This is because the molecular structure of asphalt may change, forming larger molecular chains. This structural change may cause the mixture’s stiffness to decrease at high temperatures.

In Fig. 9(b) the PG low temperature is generally positive correlation with the dynamic modulus, which is in line with the findings of [21] and Behnood and Golafshani [12]. A large value of PG low temperature typically signifies that the asphalt binder is more elastic under low temperature conditions, indicating enhanced resistance to crack.

## 4.4.2. Test condition

Fig. 10 depicts how test conditions affect dynamic modulus.

Test conditions significantly impact on the results of dynamic modulus testing for asphalt mixtures. From Fig. 10(a), it can be found that the dynamic modulus value decreases as the test temperature increases. This trend is consistent with the research results of Cho et al. [19], Guo et al. [29], Nega et al. [46] and Ali et al. [4]. This trend emerges because asphalt binder generally exhibits softer and more easily deformed properties at high temperature, decreasing in dynamic modulus.

In addition, Fig. 10(b) shows that with an increase in loading frequency, the dynamic modulus shows an upward trend and has a certain upper limit. This result can be explained by the fact that at higher loading frequencies, asphalt binder generally exhibits higher stiffness and elasticity because of its shorter deformation time, resulting in an increase in the dynamic modulus value. The upper limit can be attributed to the limitations of the asphalt mixture itself.

![](images/page_8_chart_2.jpg)

Fig. 6. Mean absolute SHAP values of the WOA-XGBoost model.

![](images/page_8_chart_4.jpg)

Fig. 7. SHAP summary plot of the influencing factors.

![](images/page_9_chart_2.jpg)

![](images/page_9_chart_3.jpg)

![](images/page_9_chart_4.jpg)

Fig. 8. Effects of asphalt binder stiffness on the dynamic modulus. (a) Asphalt binder viscosity, (b) Complex shear modulus, and (c) Phase angle.

(a)

![](images/page_9_chart_7.jpg)

![](images/page_9_chart_8.jpg)

Fig. 9. Effects of performance grade (PG) of asphalt binder on the dynamic modulus. (a) PG high temperature, and (c) PG low temperature.

![](images/page_9_chart_10.jpg)

![](images/page_9_chart_11.jpg)

Fig. 10. Effects of test conditions on the dynamic modulus. (a) Test temperature, and (b) Loading frequency.

## 4.4.3. Asphalt mixture volume parameters

Fig. 11 presents the effects of asphalt mixture volume parameters on the dynamic modulus.

Fig. 11(a) presents that there is an overall negative correlation between effective binder volume and dynamic modulus, which is consistent with the research by Behnood and Golafshani. [12]. This negative relationship may be due to the increased asphalt volume leading to reduced aggregate particle contact and uneven aggregate dispersion, thus reducing the stiffness and elasticity of the mixture, further increasing the risk of deformation.

Fig. 11(b) shows that the dynamic modulus increases with the decrease of voids, which is consistent with the research of Seo et al. [51] and Zhang et al. [65]. The reduction of voids in the asphalt mixture means an increase in the compactness of the mixture, thereby enhancing its ability to resist deformation, further leading to an increase in $\mathbf { d y } .$ namic modulus [31,29].

Fig. 11(c) does not show a clear rule regarding the impact of asphalt content on the dynamic modulus of asphalt mixtures. In the study conducted by Shu and Huang [54], it can be found that an increase in asphalt content generally results in a decrease in dynamic modulus. This difference may be because previous studies have focused on specific types of asphalt binders, whereas the data in this study covers a wider range of situations with multiple confounding factors. And according to the SHAP analysis, the feature importance of effective asphalt volume is larger than that of asphalt content. Thus, compared with asphalt content, effective asphalt volume may serve as a more appropriate indicator to deeply explore its effect on dynamic modulus and based on this relationship to design asphalt mixture.

## 4.4.4. Asphalt mixture gradation

The effects of asphalt mixture gradation on the dynamic modulus are shown in Fig. 12.

It can be clearly observed from the Fig. 12(a), (b), and (c) that as the percent retained in $3 / 4 ^ { \prime \prime } ,   3 / 8 ^ { \prime \prime }$ and #4 increase, the dynamic modulus increases first and then decrease, which is consistent with Witczak and

![](images/page_10_chart_10.jpg)

![](images/page_10_chart_11.jpg)

Fonseca [58]. The observed trend of increasing and decreasing dynamic modulus in this study may be attributed to the following reasons: an increase in coarse aggregate content enhances the skeleton of the asphalt mixture, improving its stability and strength, consequently leading to a higher dynamic modulus. But when the coarse aggregate increases excessively, the proportion of fine aggregate may become too small, resulting in increased voids in the asphalt mixture, thereby reducing the dynamic modulus. However, there are some different results obtained in some current researches focusing on the relationship between aggregate proportion and dynamic modulus. According to Liu et al. [39], a reduction in the coarse aggregate (percent retained on $3 / 4 ^ { \prime \prime } ,   3 / 8 ^ { \prime \prime }$ , and #4 sieves) results in an increase in the measured dynamic modulus. But Birgisson and Roque [15] has emphasized that there is not enough evidence to support that a low coarse aggregate proportion is associated with a large value of dynamic modulus. Because it also depends on the type of gradation and the fine aggregate proportion. No consistent conclusion can be obtained due to the limited variety of asphalt mixture gradations that previous studies have focused on.

Passing the # 200 sieve is mineral powder. As shown in Fig. 10 (d), the dynamic modulus increases when the mineral powder content increases. This finding aligns with Shu and Huang’s [54] and Liu et al [39]’s study. By increasing the mineral powder content, the microscopic voids of the asphalt mixture are filled, the bonding performance between asphalt binder and aggregate is improved, and the overall stiffness is enhanced, leading to higher dynamic modulus.

## 4.5. Application and limitation

This study predicts the dynamic modulus of asphalt mixtures using WOA-XGBoost. Four major influencing factors are considered: asphalt binder properties, test condition, asphalt mixture volume parameters, and asphalt mixture gradation. The results of the WOA-XGBoost model demonstrate satisfactory accuracy and robustness. And on the basis of this model, this study used SHAP to quantify the contribution of each influencing factor to model predictions, and used PDP to explore how changes in a specific feature affect the model’s prediction results. The research results can provide a basis for the structural analysis and the design of asphalt pavement.

![](images/page_10_chart_16.jpg)

Fig. 11. Effects of volume parameters of asphalt mixture on the dynamic modulus. (a) Effective binder volume, (b) Specimen air voids, and (c) Asphalt content.

![](images/page_11_chart_2.jpg)

![](images/page_11_chart_3.jpg)

![](images/page_11_chart_4.jpg)

![](images/page_11_chart_5.jpg)

Fig. 12. Effects of asphalt mixture gradation on the dynamic modulus. (a) Percent retained on $3 / 4 ^ { \prime \prime }$ sieve, (b)Percent retained on $3 / 8 ^ { \prime \prime }$ sieve, (c) Percent retained on #4 sieve, and (d) Percent passing #200 sieve.

The properties of the asphalt binder itself significantly affect the dynamic modulus. The higher viscosity of asphalt binder means it provides better bonding in the mixture. The larger complex shear modulus of asphalt binder means it has a higher resistance to deformation when subjected to stress. The smaller phase angle of asphalt binder indicates that the asphalt binder has better elastic properties and can better resist stress and deformation. And the higher PG indexes of asphalt binder indicates more stable performance under different temperature conditions. The dynamic modulus can be increased by selecting asphalt binders with relatively high viscosity, large complex shear modulus, small phase angle, and high PG grade.

The dynamic modulus of asphalt mixture is greatly affected by test conditions. At a constant test frequency, the dynamic modulus decreases with increasing temperature. In contrast, when maintaining a consistent test temperature, the dynamic modulus increases with increasing frequency, but this increment has a certain upper limit. The test temperature is closely related to the ambient temperature of the asphalt pavement, and the test frequency is closely related to the driving frequency of road vehicles. Therefore, paying attention to the dynamic modulus values of asphalt mixtures under different test conditions is necessary.

The volume parameters of the asphalt mixture can affect the dynamic modulus. A smaller effective asphalt volume and fewer air voids result in a higher dynamic modulus. The gradation composition of the mixture is also an important influencing factor. When the proportion of coarse aggregate increases, the dynamic modulus is generally higher because the larger aggregates provide more stiffness. However, when the proportion of coarse aggregate is excessively large, the proportion of fine aggregate may be too small, so that the air voids of the mixture will increase, resulting in a decrease in dynamic modulus. In addition, moderately increasing the amount of mineral powder can increase the dynamic modulus, because the mineral powder can fill the voids and increase the strength of the mixture.

Although the WOA-XGBoost based asphalt mixture dynamic modulus prediction model has satisfactory estimation accuracy, it does have some limitations that may be improved through future research. In the proposed model, only explanatory variables are proven to have a high correlation with the outcome and have high predictive power. Future research work can enhance the dynamic modulus prediction of asphalt mixtures by introducing additional variables, such as more detailed asphalt mixture gradation, asphalt type, aggregate type and properties, and more detailed asphalt mixture gradation and volume parameters.

## 5. Conclusions

In this study, a WOA-XGBoost is developed to predict the dynamic modulus of asphalt mixtures considering asphalt binder properties, test condition, asphalt mixture volume parameters and asphalt mixture gradation. SHAP and PDP are used to investigate the effects of influencing factors on dynamic modulus. The main conclusions are as follows.

• The performance of the XGBoost model has been significantly improved after using WOA hyper-parameter optimization. And the results of SHAP and PDP enhance the credibility of the proposed model.

• The SHAP analysis shows the contribution of each influencing factor to the model’s prediction. The complex shear modulus of asphalt binder, test temperature and asphalt binder viscosity are the three most important features for predicting dynamic modulus.

• The PDP analysis shows that the dynamic modulus can be increased by using asphalt binders with relatively large complex modulus, high viscosity, small phase angle, high asphalt PG indexes. Reducing the effect binder volume, reducing air voids of the mixture, adjusting the proportion of aggregate to an appropriate and increasing the mineral powder content can increase dynamic modulus. Additionally, decreasing the test temperature and increasing the frequency contribute to increasing dynamic modulus.

This study clarifies the impact of influencing factors on the performance of asphalt mixtures based on machine learning, which is of great significance to the intelligent design of asphalt mixtures. Future studies could aim to expand the dataset to include a wider variety of asphalt binder types and environmental conditions. This would help to generalize the model’s applicability and ensure its robustness across diverse geographical and climatic scenarios.

## CRediT authorship contribution statement

**Ke Zhang:** Writing – review & editing, Writing – original draft, Visualization, Validation, Software, Methodology, Investigation, Formal analysis. **Zhaohui Min:** Writing – original draft, Supervision. **Xiatong Hao:** Writing – original draft, Software, Methodology, Formal analysis. **Theunis F.P. Henning:** Writing – review & editing, Visualization, Methodology, Investigation. **Wei Huang:** Writing – review & editing, Supervision, Resources, Conceptualization.

## Declaration of competing interest

The authors declare that they have no known competing financial interests or personal relationships that could have appeared to influence the work reported in this paper.

## Acknowledgements

This study is sponsored by Major Science and Technology Project of Nanjing (No. 202209012) and Postgraduate Research&Practice Innovation Program of Jiangsu Province (KYCX22-0277).

## Data availability

Data will be made available on request.

## References

[1] A. AASHTO. Mechanistic-empirical pavement design guide: A manual of practice. AAoSHaT Officials, Editor (2008).

[2] P. Aggarwal (2017, December). Predicting dynamic modulus for bituminous concrete using support vector machine. In 2017 International Conference on Infocom Technologies and Unmanned Systems (Trends and Future Directions) (ICTUS) (pp. 751-755). IEEE.

[3] [G. Al-Khateeb, A. Shenoy, N. Gibson, T. Harman, A new simplistic model for dynamic modulus predictions of asphalt paving mixtures, J. Assoc. Asphalt Paving Technol. 75 (2006)](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0015).

[4] [Y. Ali, M. Irfan, S. Ahmed, S. Khanzada, T. Mahmood, Investigation of factors affecting dynamic modulus and phase angle of various asphalt concrete mixtures, Mater. Struct. 49 (2016) 857–868](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0020).

[5] [Y. Ali, F. Hussain, M. Irfan, A.S. Buller, An eXtreme Gradient Boosting model for predicting dynamic modulus of asphalt concrete mixtures, Constr. Build. Mater. 295 (2021) 123642](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0025).

[6] F.T. Aragão, Y. Kim, P. Karki, D.N. Little, Semiempirical, analytical, and [computational predictions of dynamic modulus of asphalt concrete mixtures, Transp. Res. Rec. 2181 (1) (2010) 19–27](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0030).

[7] ASTM. (2016). Standard practice for viscosity-temperature chart for asphalt binders.

[8] [A. Awed, S. El-Badawy, F. Bayomy, M. Santi, in: Influence of the MEPDG Binder Characterization Input Level on the Predicted Dynamic Modulus for Idaho Asphalt Concrete Mixtures, Washington DC, USA, 2011, pp. 23–27](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0040).

[9] [J. Bari, Development of a new revised version of the Witczak E\* predictive models for hot mix asphalt mixtures, Arizona State University, 2005](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0045).

[10] [J. Bari, M.W. Witczak, New predictive models for viscosity and complex shear modulus of asphalt binders: for use with mechanistic-empirical pavement design guide, Transp. Res. Rec. 2001 (1) (2007) 9–19](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0050).

[11] [J. Barugahare, A.N. Amirkhanian, F. Xiao, S.N. Amirkhanian, Evaluation of ANN-based dynamic modulus models of asphalt mixtures, J. Mater. Civ. Eng. 33 (6) (2021) 04021099](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0055).

[12] [A. Behnood, E.M. Golafshani, Predicting the dynamic modulus of asphalt mixture using machine learning techniques: An application of multi biogeography-based programming, Constr. Build. Mater. 266 (2021) 120983](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0060).

[13] T.A. Bennert (2009). Dynamic modulus of hot mix asphalt (No. FHWA-NJ-2009-011).

[14] [Y. Bi, F. Guo, J. Zhang, J. Pei, R. Li, Correlation analysis between asphalt binder/ asphalt mastic properties and dynamic modulus of asphalt mixture, Constr. Build. Mater. 276 (2021) 122256](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0070).

[15] [B. Birgisson, R. Roque, Evaluation of the gradation effect on the dynamic modulus, Transp. Res. Rec. 1929 (1) (2005) 193–199](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0080).

[16] [H. Chen, R.G. Saba, G. Liu, D.M. Barbieri, X. Zhang, I. Hoff, Influence of material factors on the determination of dynamic moduli and associated prediction models for different types of asphalt mixtures, Constr. Build. Mater. 365 (2023) 130134](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0085).

[17] [T. Chen, C. Guestrin, Xgboost: A scalable tree boosting system, in: In Proceedings of the 22nd Acm Sigkdd International Conference on Knowledge Discovery and Data Mining, 2016, pp. 785–794](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0090).

[18] [Z. Chen, F. Xiao, F. Guo, J. Yan, Interpretable machine learning for building energy management: A state-of-the-art review, Adv. Appl. Energy 100123 (2023)](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0095).

[19] [Y.H. Cho, D.W. Park, S.D. Hwang, A predictive equation for dynamic modulus of asphalt mixtures used in Korea, Constr. Build. Mater. 24 (4) (2010) 513–519](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0100).

[20] [D.W. Christensen Jr, T. Pellinen, R.F. Bonaquist, Hirsch model for estimating the modulus of asphalt concrete, J. Assoc. Asphalt Paving Technol. 72 (2003)](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0105).

[21] S.A. Cross, Y. Jakatimath, S. KC. Determination of dynamic modulus master curves for Oklahoma HMA mixtures (No. FHWA/OK 07 (05)). Oklahoma State University (2007).

[22] [T. Cuong-Le, T. Nghia-Nguyen, S. Khatir, P. Trong-Nguyen, S. Mirjalili, K. D. Nguyen, An efficient approach for damage identification based on improved machine learning using PSO-SVM, Eng. Comput. (2021) 1–16](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0115).

[23] [A. Dezhkam, M.T. Manzuri, Forecasting stock market for an efficient portfolio by combining XGBoost and Hilbert-Huang transform, Eng. Appl. Artif. Intel. 118 (2023) 105626](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0120).

[24] [M. Dorigo, M. Birattari, T. Stutzle, Ant colony optimization, IEEE Comput. Intell. Mag. 1 (4) (2006) 28–39](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0125).

[25] [M.S.S. Far, B.S. Underwood, S.R. Ranjithan, Y.R. Kim, N. Jackson, Application of artificial neural networks for estimating dynamic modulus of asphalt concrete, Transp. Res. Rec. 2127 (1) (2009) 173–186](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0130).

[26] [G.W. Flintsch, A. Loulizi, S.D. Diefenderfer, B.K. Diefenderfer, K.A. Galal, Asphalt material characterization in support of mechanistic–empirical pavement design guide implementation in virginia, Transp. Res. Rec. 2057 (1) (2008) 114–125](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0135).

[27] [J.H. Friedman, Greedy function approximation: a gradient boosting machine, Ann. Stat. (2001) 1189–1232](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0140).

[28] [J.H. Friedman, Stochastic gradient boosting, Comput. Stat. Data Anal. 38 (4) (2002) 367–378](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0145).

[29] [L. Guo, Q. Xu, G. Zeng, W. Wu, M. Zhou, X. Yan, J. Wei, Comparative study on complex modulus and dynamic modulus of high-modulus asphalt mixture, Coatings 11 (12) (2021) 1502](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0150).

[30] [X. Hao, X. Hu, T. Liu, C. Wang, L. Wang, Estimating urban PM2. 5 concentration: An analysis on the nonlinear effects of explanatory variables based on gradient boosted regression tree, Urban Clim. 44 (2022) 101172](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0155).

[31] [J.T. Harvey, B.W. Tsai, Effects of asphalt content and air void content on mix fatigue and stiffness, Transp. Res. Rec. 1543 (1) (1996) 38–45](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0160).

[32] [J. Huang, G.S. Kumar, J. Ren, J. Zhang, Y. Sun, Accurately predicting dynamic modulus of asphalt mixtures in low-temperature regions using hybrid artificial intelligence model, Constr. Build. Mater. 297 (2021) 123655](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0165).

[33] [M.R. Islam, S.A. Kalevela, G. Mendel, How the mix factors affect the dynamic modulus of hot-mix asphalt, Journal of Composites Science 3 (3) (2019) 72](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0170).

[34] [J. Kennedy, R. Eberhart, Particle Swarm Optimization 4 (1995) 1942–1948](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0175).

[35] [C.S. Lee, S. Mangalathu, J.S. Jeon, Machine learning–assisted drift capacity prediction models for reinforced concrete columns with shape memory alloy bars, Comput. Aided Civ. Inf. Eng. (2023)](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0180).

[36] [X. Li, M.O. Marasteanu, R.C. Williams, T.R. Clyne, Effect of reclaimed asphalt pavement (proportion and type) and binder grade on asphalt mixtures, Transp. Res. Rec. 2051 (1) (2008) 90–97](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0185).

[37] [S. Lim, S. Chi, Xgboost application on bridge management systems for proactive damage estimation, Adv. Eng. Inf. 41 (2019) 100922](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0190).

[38] [Z.C. Lipton, The mythos of model interpretability: In machine learning, the concept of interpretability is both important and slippery, Queue 16 (3) (2018) 31–57](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0195).

[39] [J. Liu, K. Yan, L. You, P. Liu, K. Yan, Prediction models of mixtures’ dynamic modulus using gene expression programming, Int. J. Pavement Eng. 18 (11) (2017) 971–980](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0200).

[40] [J. Liu, K. Yan, J. Liu, X. Zhao, Using artificial neural networks to predict the dynamic modulus of asphalt mixtures containing recycled asphalt shingles, J. Mater. Civ. Eng. 30 (4) (2018) 04018051](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0205).

[41] [S.M. Lundberg, S.I. Lee, A unified approach to interpreting model predictions, in: Advances in Neural Information Processing Systems, 2017, p. 30](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0210).

[42] [S. Mangalathu, S.H. Hwang, J.S. Jeon, Failure mode and effects analysis of RC members based on machine-learning-based SHapley Additive exPlanations (SHAP) approach, Eng. Struct. 219 (2020) 110927](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0215).

[43] [S. Mirjalili, A. Lewis, The whale optimization algorithm, Adv. Eng. Softw. 95 (2016) 51–67](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0220).

[44] [H. Nasief, C. Zheng, D. Schott, W. Hall, S. Tsai, B. Erickson, X. Allen Li, A machine learning based delta-radiomics process for early prediction of treatment response of pancreatic cancer, npj Precis. Oncol. 3 (1) (2019) 25](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0225).

[45] [H. Naseri, H. Jahanbakhsh, A. Foomajd, N. Galustanian, M.M. Karimi, D.E. O. Waygood, A newly developed hybrid method on pavement maintenance and rehabilitation optimization applying Whale Optimization Algorithm and random forest regression, Int. J. Pavement Eng. 24 (2) (2023) 2147672](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0230).

[46] [A. Nega, B. Ghadimi, H. Nikraz, Developing master curves, binder viscosity and predicting dynamic modulus of polymer-modified asphalt mixtures, Int. J. Eng. Technol. (IJET) 7 (3) (2015) 190–197](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0235).

[47] [N.T. Ngo, T.T.H. Truong, N.S. Truong, A.D. Pham, N.T. Huynh, T.M. Pham, V.H. S. Pham, Proposing a hybrid metaheuristic optimization algorithm and machine learning model for energy use forecast in non-residential buildings, Sci. Rep. 12 (1) (2022) 1065](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0240).

[48] [H. Nguyen, M.T. Cao, X.L. Tran, T.H. Tran, N.D. Hoang, A novel whale optimization algorithm optimized XGBoost regression for estimating bearing capacity of concrete piles, Neural Comput. & Applic. 35 (5) (2023) 3825–3852](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0245).

[49] [Y. Peng, C. Li, Y. Rong, C.P. Pang, X. Chen, H. Chen, Real-time prediction of the daily incidence of COVID-19 in 215 countries and territories using machine learning: model development and validation, J. Med. Internet Res. 23 (6) (2021) e24285](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0250).

[50] [R. Priyadarshini, H. Joardar, S.K. Bisoy, T. Badapanda, Crystal structural prediction of perovskite materials using machine learning: A comparative study, Solid State Commun. 361 (2023) 115062](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0255).

[51] [Y. Seo, O. El-Haggan, M. King, S. Joon Lee, Y. Richard Kim, Air void models for the dynamic modulus, fatigue cracking, and rutting of asphalt concrete, J. Mater. Civ. Eng. 19 (10) (2007) 874–883](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0260).

[52] L.S. Shapley (1953). A value for n-person games.

[53] [S. Sheikhi, An effective fake news detection method using WOA-xgbTree algorithm and content-based features, Appl. Soft Comput. 109 (2021) 107559](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0270).

[54] [X. Shu, B. Huang, Micromechanics-based dynamic modulus prediction of polymeric asphalt concrete mixtures, Compos. B Eng. 39 (4) (2008) 704–713](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0275).

[55] [X. Sun, H. Wang, S. Mei, Explainable highway performance degradation prediction model based on LSTM, Adv. Eng. Inf. 61 (2024) 102539](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0280).

[56] [L.F. Walubita, J. Zhang, G. Das, X. Hu, C. Mushota, A.E. Alvarez, T. Scullion, Hotmix asphalt permanent deformation evaluated by Hamburg wheel tracking, dynamic modulus, and repeated load tests, Transp. Res. Rec. 2296 (1) (2012) 46–56](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0285).

[57] [Y. Wang, J. Zhao, K. Jiang, Q. Zhou, Z. Kang, C. Chen, H. Zhang, Prediction of TBM operation parameters using machine learning models based on BPSO, Adv. Eng. Inf. 56 (2023) 101955](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0290).

[58] [M.W. Witczak, O.A. Fonseca, Revised predictive model for dynamic (complex) modulus of asphalt mixtures, Transp. Res. Rec. 1540 (1) (1996) 15–23](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0295).

[59] M.W. Witczak (2005). Simple performance tests: Summary of recommended methods and database (Vol. 46). Transportation Research Board.

[60] [Y. Xie, S. Gao, C. Zhang, J. Liu, Tool wear state recognition and prediction method based on laplacian eigenmap with ensemble learning model, Adv. Eng. Inf. 60 (2024) 102382](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0305).

[61] [S. Xiong, Z. Liu, C. Min, Y. Shi, S. Zhang, W. Liu, Compressive strength prediction of cemented backfill containing phosphate tailings using extreme gradient boosting optimized by whale optimization algorithm, Materials 16 (1) (2022) 308](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0310).

[62] [H. Yan, Z. He, C. Gao, M. Xie, H. Sheng, H. Chen, Investment estimation of prefabricated concrete buildings based on XGBoost machine learning algorithm, Adv. Eng. Inf. 54 (2022) 101789](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0315).

[63] [S. Yousefdoost, B. Vuong, I. Rickards, P. Armstrong, B. Sullivan, September). Evaluation of dynamic modulus predictive models for typical Australian asphalt mixes, in: In Proceedings of the 15th AAPA International Flexible Pavements Conference, 2013, pp. 22–25](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0320).

[64] [J. Zhang, Z. Fan, H. Wang, W. Sun, J. Pei, D. Wang, Prediction of dynamic modulus of asphalt mixture using micromechanical method with radial distribution functions, Mater. Struct. 52 (2019) 1–12](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0325).

[65] [Y. Zhang, R. Luo, R.L. Lytton, Characterizing permanent deformation and fracture of asphalt mixtures by using compressive dynamic modulus tests, J. Mater. Civ. Eng. 24 (7) (2012) 898–906](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0330).

[66] [H. Zheng, T. Zhou, T. Han, S. Li, C. Yu, An interpretable prediction framework for multi-class situational awareness in conditionally automated driving, Adv. Eng. Inf. 62 (2024) 102683](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0335).

[67] [Z. Zhong, S. Zhao, J. Xia, Q. Luo, Q. Zhou, S. Yang, Y. Yao, Regression prediction model for shear strength of cold joint in concrete, Structures 68 (2024) 107168](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0340).

[68] [J. Zhu, Y. Ma, Y. Zhang, Y. Zhang, C. Lv, Takeover quality prediction based on driver physiological state of different cognitive tasks in conditionally automated driving, Adv. Eng. Inf. 57 (2023) 102100](http://refhub.elsevier.com/S1474-0346%2825%2900004-7/h0345).