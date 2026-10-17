<!--
SOURCE: 原始 PDF: reference/材料-性能关系/2025-Applied Sciences-Regression-Based Performance Prediction in Asphalt Mixture Design and Input Analysis with SHAP.pdf | 页数: 32 | 集合: reference
题录: litfull-091 Regression-Based Performance Prediction in Asphalt Mixture Design and Input Analysis with SHAP (DOI: 10.3390/app151910779)
提取: MinerU markdown 全文（可重建索引的真相源副本；images/ 不入 corpus）
-->

Article

# Regression-Based Performance Prediction in Asphalt Mixture Design and Input Analysis with SHAP

**Kemal Muhammet Erten** <strong><sup>1</sup></strong>**,\* and Remzi Gürfidan** <strong><sup>2</sup></strong>

1 Yalvaç Vocational School of Technical Sciences, Building Inspection, Isparta University of Applied Sciences Isparta 32100, Türkiye

2 Isparta Vocational School of Information Technologies, Database, Network Design and Management, Isparta University of Applied Sciences, Isparta 32100, Türkiye; remzigurfidan@isparta.edu.tr

\* Correspondence: kemalerten@isparta.edu.tr

## Abstract

The primary aim of this study is to predict the Marshall stability and flow values of hot-mix asphalt samples prepared according to the Marshall design method using regression-based machine learning algorithms. To overcome the limited number of experimental observations, synthetic data generation was applied using the Conditional Tabular Generative Adversarial Network (CTGAN), while the structural consistency of the generated data was validated through Principal Component Analysis (PCA). Two datasets containing 17 physical and mechanical input variables were analyzed, and multiple regression models were compared, including Extra Trees, Random Forest, Gradient Boosting, AdaBoost, and K-Nearest Neighbors. Among these, the Extra Trees Regressor consistently achieved the best results with near-perfect accuracy in flow predictions (MAE ≈ 4.06 × 10−15, RMSE ≈ 4.97 × 10−15, Accuracy ≈ 99.99%) and high performance in stability predictions (MAE = 109.52, RMSE = 150.67, accuracy = 90.45%). Furthermore, model interpretability was ensured by applying SHapley Additive Explanations (SHAP), which revealed that parameters such as softening point, VMA, penetration, and void ratios were the most influential features. These findings demonstrate that regression-based ensemble models, combined with synthetic data augmentation and explainable AI methods, can serve as reliable and interpretable tools in asphalt mixture design.

![](images/page_0_image_11.jpg)

Received: 3 September 2025 Revised: 25 September 2025 Accepted: 4 October 2025 Published: 7 October 2025

**Citation:** Erten, K.M.; Gürfidan, R. Regression-Based Performance Prediction in Asphalt Mixture Design and Input Analysis with SHAP. Appl. Sci. **2025**, 15, 10779. [https://doi.org/10.3390/app151910779](https://doi.org/10.3390/app151910779)

**Copyright:** © 2025 by the authors. Licensee MDPI, Basel, Switzerland. This article is an open access article distributed under the terms and conditions of the Creative Commons Attribution (CC BY) license ([https://creativecommons.org/licenses/by/4.0/](https://creativecommons.org/licenses/by/4.0/)).

**Keywords:** Marshall stability; flow prediction; machine learning; SHAP

## 1. Introduction

Marshall design is one of the most common mix design methods developed to produce high-quality bituminous mixtures. With the right design, pavements maintain their service performance for many years. To ensure the proper production of pavements with the required quality and performance, certain fundamental conditions must be met, such as flexibility [1], durability [2], stability [3], fatigue resistance [4], etc. Therefore, aggregates, bitumen, any additives, and the resulting mixtures must meet the conditions specified by standards.

One of the most important mechanical parameters considered by researchers for flexible superstructures designed to withstand dynamic loads and environmental effects is Marshall stability and flow values [5–8]. The stability we refer to as deformation resistance under load [9,10] is known to be significantly affected by the physical properties of the bitumen and aggregate used in the mixture [11,12]. The flow value, which serves as an indicator of the mixture’s flexibility, represents the deformation at the point when the Marshall sample breaks [9,11]. Although different methods and relationships also exist [13–16], the Marshall method is used to determine the optimal bitumen quantities for the upper structure layers to be produced [17–20]. This enables designs that comply with the limits specified in the standards for the upper structure layers.

Although Marshall stability and flow values are considered by some researchers as a limited technical indicator, these parameters form the basis of the Marshall design method, which is widely used in field applications. In addition, this method is still preferred in asphalt pavement design, especially in developing countries due to its low cost and applicability. Therefore, in this study, it is important to both estimate these parameters with high accuracy and to make these estimates interpretable from an engineering point of view with the SHAP method to provide practical decision support.

Today, although there is a growing trend towards the SUPERPAVE (Superior Performing Asphalt Pavement) method [21–23], which allows for a more comprehensive evaluation of different temperatures than the Marshall design, the Marshall design is still frequently preferred due to its simplicity and low cost. To produce using the Marshall method, mate rials, time, equipment, and budget are required. However, as in this study, technological advancements enable reliable and straightforward prediction of results based on previous experimental studies. Therefore, in recent years, studies have been conducted to predict stability and flow values.

Gul et al. used Artificial Neural Network (ANN), Adaptive Neuro-Fuzzy Inference System (ANFIS), and Multi-Statement Programming (MEP) to estimate Marshall stability and flow values and noted that MEP models yielded better results [24]. Shah, Anwar, Arshad, Qurashi, Nisar, Khan, and Waseem, 2020, used the ANN method to estimate the Marshall stability of asphalt mixtures prepared at four different test temperatures and with two different aggregate types [25]. They emphasized that their proposed model has the potential to understand the mechanical behavior under different temperature conditions [25]. Upadhya et al. used six machine learning techniques—Artificial Neural Networks, Support Vector Machines, Gaussian process, M5P tree, Random Forest, and Random-Tree-based models—to estimate the Marshall stability of carbon-fiber asphalt mixtures and attempted to evaluate the potential of the models. As a result, it was noted that the ANN-based model performed better than other models applied to predict the Marshall stability of asphalt concrete using carbon fiber [26]. Asi et al. predicted Marshall stability and flow values using the CatBoost, LightGBM, XGBoost, and Extra Trees techniques with the PyCaret library in Python 3.13. The authors noted that the CatBoost regression model performed better than the other models [27]. Upadhya et al. predicted the stability value of glass-fiber-reinforced asphalt concrete using Artificial Neural Network (ANN), Random Forest (RF), Random Tree (RT), and Adaptive Neuro-Fuzzy Inference System (ANFIS) methods and found that the ANFIS method based on the trapezoidal membership function (ANFIS\_trapmf) was more suitable for Marshall stability prediction than the other applied models [28]. Jalota and Suthar predicted the stability values of polypropylene-fiberreinforced asphalt concrete using five modeling techniques: normalized polynomial kernel function (SVM-NormPoly), radial basis kernel function (SVM-RBF), polynomial kernel function (SVM-poly), Pearson universal VII kernel function (SVM-PUK), and Artificial Neural Network (ANN) [29]. Awan et al. predicted Marshall stability and flow values for Asphalt Base Course (ABC) and Asphalt Wearing Course (AWC) using Multi-Expression Programming (MEP). The authors noted that MEP could be used to predict Marshall parameters based on the results obtained [30]. Mistry and Roy investigated the effect of using different filler materials (hydrated lime, rice husk ash, and fly ash) at various ratios on the Marshall stability and flow properties of dense-grade bituminous macadam mixtures.

The authors developed two separate ANFIS models using a Sugeno-type fuzzy inference system and reported that the ANFIS models could predict the Marshall test results of HMA mixtures containing various fillers at different ratios with good accuracy [31].

The increasing interest in renewable energy sources has necessitated the development of methods that will provide high accuracy in the prediction of nature-dependent energy types such as solar and wind energy. In this context, accurate prediction of variables such as Global Horizontal Irradiance (GHI) is of great importance for energy management and system integration. Gupta et al. developed a CNN-LSTM-GRU-based hybrid deep learning algorithm to process both spatial and temporal data in a holistic manner and proved the success of the model by obtaining low MAE and RMSE values in tests conducted in the Barmer et al. regions [32]. This approach both overcomes the limitations of traditional single architecture and provides a significant improvement in solar energy prediction with the deep context analysis offered by the hybrid structure. Similarly, LSTM-based time series models are widely used, especially for the prediction of dynamic variables such as wind speed. In a comparative study of Bi-LSTM and Uni-LSTM architectures, it was shown that the Bi-LSTM architecture achieves higher accuracy and lower error rates due to its ability to process forward and backward time information simultaneously [33]. Despite the high performance offered by deep learning methods, limitations regarding the interpretability of models have brought the integration of explainable artificial intelligence (XAI) approaches into energy forecasting models to the agenda. In this context, Gupta and Yadav, who performed GHI forecasting with an XAI-supported XGBoost model, developed a forecasting model with not only high performance but also open decision processes using SHAP analyses [34]. In addition to deep learning and XAI-based models, ensembles using machine learning models have also produced remarkable results in energy prediction. In the stacked ensemble proposed by Jha, Yadav, and Gupta, algorithms such as LSTM, SVR, and RF are configured as base learners, and the outputs of these models are blended through a meta-learner to obtain more balanced and high-accuracy predictions [35]. Thus, both the reliability and generalization capability of energy forecasting systems are increased through model diversity and interaction. On the other hand, it is observed that not only prediction but also simulation-based analyses make significant contributions to energy systems. Bharti et al. modeled a solar water pump system using the Arduino Uno and Proteus environment and showed that performance analyses can be performed before field installation [36]. This approach provides a viable framework for low-cost renewable energy solutions, especially in rural areas.

In the study by Mohamed and Mahmood, air quality in Delhi was analyzed and predicted using the K-Nearest Neighbor (KNN) algorithm. In the study, air pollution indicators such as PM2.5, PM10, and NO2 were used for classification and prediction based on historical data. The accuracy of the model was tested with various metrics, and it was found that the KNN algorithm provides satisfactory results in air quality predictions [37]. In their review, El-Sayed comprehensively analyzed machine learning models used to predict air quality in urban areas. Common algorithms such as Artificial Neural Networks (ANN), Support Vector Machines (SVM), Decision Trees (DT), Random Forests (RF), and KNN are compared in terms of accuracy, computational cost, and generalizability. The study emphasizes that deep-learning-based models perform better on complex urban data, but interpretability is still a challenge [38]. Salamai et al. developed a dynamic voting classifier based on the Sine Cosine Dynamic Group (SCDG) algorithm to identify the risks encountered in Supply Chain 4.0. In the study, internal and external operational risks were successfully classified using service contracts and transaction data obtained from companies in Saudi Arabia. The model showed high performance with a balanced accuracy of 98.9% and a low MSE (0.0476) [39]. In their study, El-Kenawy et al. propose a new nature-inspired optimization algorithm called Greylag Goose Optimization (GGO). Inspired by the social migration behavior of grey geese, GGO aims to search efficiently in the solution space to be optimized with features such as flock-based search, leader following, and dynamic position updates. The authors tested GGO on more than 30 standard test functions and some engineering problems and compared the results with existing methods such as PSO, GWO, DE, and GA. The results show that GGO is competitive in terms of both global optimization and fast convergence and outperforms in most cases [40]. Alhussan et al. proposed a transfer learning approach supported by the Adaptive Mutation Dipper-Throated Optimization (AMDTO) algorithm to perform pothole and plain road classification. This deep-learning-based model has been benchmarked against pre-trained networks such as ResNet50, VGG16, and InceptionV3 and optimized to be particularly applicable to mobile devices. The AMDTO algorithm improved the overall accuracy of the model to 97.26% by improving the parameter settings during the training process [41].

Finally, the impact of advanced machine learning models on weather forecasting is also remarkable. Algorithms such as XGBoost, LightGBM, and CatBoost have been found to achieve high AUROC and low RMSE values in forecasts based on historical weather data, and XGBoost has especially shown superior success compared to others [42]. All these studies show that hybrid model approaches, interpretable artificial intelligence applications, algorithmic integration, and hardware-assisted simulations in renewable energy forecasting can increase the accuracy, reliability, and sustainability of energy systems with complementary effects.

In the first section of the study, data obtained experimentally from four different studies [9,13,22,43] were used to estimate Marshall stability and flow values, while in the second section, data obtained experimentally from three different studies [12,44,45] were used. Experimental data related to aggregate, bitumen, and mixtures that could affect Marshall results were used as inputs, and care was taken to ensure that all data headings were consistent across the studies for both sections. This allowed the prediction models to be trained correctly, enabling the estimation of experimental results for flow and stability.

The following research questions and testable hypotheses are listed to clarify the scientific framework and objectives of this study.

Research Questions

Can the Marshall stability and flow values of asphalt mixtures be predicted with high accuracy using machine learning algorithms?

Does CTGAN-based synthetic data augmentation improve the generalization performance of predictive models developed on small datasets?

Can SHAP effectively reveal the internal decision mechanisms of the machine learning models and provide engineering-relevant interpretations?

What are the most influential physical and mechanical parameters in predicting Marshall flow and stability, and how do these factors vary across different datasets?

Do the predictive performances of models trained on two distinct datasets differ significantly in terms of error metrics and importance of features?

Hypotheses

H0: CTGAN-based synthetic data generation maintains the statistical distribution of the original dataset in a consistent and valid manner.

H1: CTGAN-based synthetic data generation does not maintain the statistical distribution of the original dataset.

H0: The Extra Trees Regressor outperforms other regression models in predicting Marshall stability and flow values based on accuracy and error metrics.

H1: The Extra Trees Regressor does not show statistically significant performance improvements over other regression models.

H0: SHAP analysis identifies feature importance rankings that align with engineering knowledge regarding asphalt mixture design.

H1: SHAP analysis does not yield feature importance rankings consistent with engineering understanding of asphalt materials.

Recent studies in materials engineering, particularly in asphalt mixture design, have increasingly adopted machine learning to predict performance indicators such as stability and flow. While models like Random Forest, Gradient Boosting, and ANN have shown promise, their effectiveness is often limited by small datasets and lack of interpretability. This study addresses these challenges by integrating CTGAN-based data augmentation with SHAP-based interpretability, offering a novel contribution to machine learning applications in asphalt mixture design.

In the second part of the study, the datasets and data augmentation methods used in the study are explained. Afterwards, machine learning methods are explained, and the application of the explainable artificial intelligence model and the findings obtained are discussed.

## 2. Materials and Methods

In this study, it was aimed to predict the stability and flow values of hot-mix asphalt specimens produced based on the Marshall design method by using laboratory data with machine learning algorithms. In this context, two different data sets were created. Both datasets consist of 17 input and 1 output variables, including physical and mechanical parameters related to aggregate grain size distributions, binder properties, and void ratios. The first dataset consists of 60 original observations obtained directly in the laboratory. The second dataset is structurally like the first dataset and was reconstructed by changing the proportions of ten different aggregate fractions, namely sd19, sd12.5, sd9.5, sd4.75, sd2.36, sd1.18, sd0.6, sd0.3, sd0.15, and sd0.075. In this way, the effect of granulometric variation on the model was analyzed more comprehensively, and the generalization ability of the model against different distributional structures was evaluated. The same data processing steps were applied to both datasets, and modeling processes were carried out by cleaning missing data, normalization, CTGAN-based data augmentation methods, and various regression algorithms. Finally, SHAP (SHapley Additive Explanations) method was used to ensure the explainability of the developed models, and the contribution of each variable to the model predictions was analyzed in detail. The approach and strategies followed in conducting the study are shown in Figure 1 in the form of a block diagram.

The data analysis and modeling process used in this study is based on a systematic workflow consisting of eight stages. In the first step, raw data were collected (Data Collection), and these data were organized into datasets (Creation of Data Sets) in the second step. In the third step, missing data was removed, and all variables were normalized as part of the Data Preprocessing steps. Then, in the fourth step, the dataset was expanded, and the generalization capability of the model was increased by using the CTGAN-based data augmentation method. After data augmentation, in the fifth step, Principal Component Analysis (PCA) was applied to verify the integrity and distributional structure of both original and synthetic data. In the sixth step, modeling was performed using various machine learning algorithms (Machine Learning Models) on the expanded and validated data. In the seventh step, Explainability tools such as SHAP were used to analyze how the models decide on which variables. Finally, in the eighth step, model performance was evaluated (Model Performance Analysis), and the results were interpreted from an engineering perspective and technical recommendations are presented (Engineering Reviews and Recommendations). This structure covers not only prediction accuracy but also decisions that support mechanisms for engineering applications.

![](images/page_5_image_3.jpg)

Figure 1. Data analysis and modeling workflow.

## 2.1. First Dataset

The machine learning models used to predict Marshall stability and flow values were fed with a total of 17 input parameters. These parameters include both physical and chemical characteristics of the mixture such as aggregate granulometry, bitumen properties, and void structure. The granulometric structure is represented by ten grain size fractions corresponding to the following aggregate size distribution: sd19, sd12.5, sd9.5, sd4.75, sd2.36, sd1.18, sd0.6, sd0.3, sd0.15, and sd0.075. These fractions have a direct effect on strength and void relationships by specifying the proportions of aggregate fractions in the mix. Penetration and softening point variables define the degree of stiffness of the binder by reflecting the viscosity and temperature behavior of the bitumen used. The bitumen as percentage by weight of aggregate (Wa) parameter affects the plasticity and durability properties of the mix by expressing the amount of binder as a mass fraction. The density-based practical specific gravity, Dp, variable plays a critical role in determining the volumetric stability of the aggregate–bitumen mix, while the percentage of void in the mixture (Vh), void ratio between aggregate grains (VM), and void ratio filled with bitumen VFA (Vf) parameters define the void structure of the mix and are directly related to performance criteria such as durability, deformation resistance, and saturation. All these parameters represent multidimensional interactions that affect structural stability in hot-mix asphalt design and provide high explanatory capability to machine learning models.

In this study, since the original dataset contains a limited number of observations, CTGAN-based synthetic data generation was performed to increase the generalization capability of the model. During the data augmentation process, special attention was paid to preserving the distributional characteristics of the original dataset and increasing its representativeness; for this purpose, the statistical consistency of the synthetic data was verified by PCA (Principal Component Analysis) analysis. Although it was observed that some outliers could not be fully represented, this is a natural limitation frequently encountered in the data augmentation literature and did not affect the overall learning success of the model.

## 2.1.1. First Dataset FLOW Prediction

In this study, data augmentation was performed on Marshall test data of asphalt mixtures, and the statistical consistency of the augmented samples was visualized by Principal Component Analysis (PCA). The original dataset consisted of only 60 samples, which limits the generalization capacity of machine learning models. To overcome this deficiency, the dataset was increased to 250 samples by applying a CTGAN (Conditional Tabular GAN)-based synthetic data generation method. The two-dimensional projection graph obtained from the PCA analysis shown in Figure 2 that the original and synthetic data largely overlap each other. In particular, the clustering structures observed in the first and second principal component planes show that the statistical properties of the data generated by CTGAN successfully mimic the original dataset and do not distort the distribution pattern. In addition, it is observed that the augmented data expands to cover the distribution of the original data and makes the data space more balanced. This supports the fact that the models are more resistant to overfitting during training and their performance is improved. In conclusion, the PCA analysis reveals that the applied data augmentation technique is both structurally and distributionally valid and successful.

![](images/page_6_chart_4.jpg)

Figure 2. PCA graph for first dataset flow values.

The visual comparison between the original and CTGAN-generated datasets shown in Figure 3 demonstrates that the synthetic data successfully approximates the overall distribution patterns of many variables. In coarse aggregate fractions such as sd19, sd12.5, and sd9.5, the central tendencies of the original dataset are well reproduced, and the synthetic distributions largely overlap with the empirical density curves. For intermediate sieve sizes (e.g., sd2.36 and sd1.18), both datasets reveal a bimodal structure, with the synthetic data capturing the dominant peaks observed in the original measurements. Although in fine aggregate fractions (sd0.6, sd0.3, sd0.15, and sd0.075) the synthetic distributions appear more concentrated around central values, they still follow the general shape and scale of the original curves. In terms of engineering parameters such as softening point, bitumen content, and specific gravity, the synthetic data align closely with the original, preserving not only mean values but also characteristic distribution forms. While some deviations are noticeable in penetration and flow, the synthetic dataset nonetheless reflects the main behavioral tendencies of the original data. Overall, the graphical evaluation suggests that the CTGAN model can generate synthetic data that is broadly consistent with the original dataset, capturing the essential distributional characteristics required for subsequent modeling and analysis.

![](images/page_7_chart_2.jpg)

Figure 3. Comparison of original and synthetic data distributions.

In Table 1, a detailed comparative analysis of different machine learning algorithms for regression prediction of flow (mm) is presented. The evaluated models include Extra Trees Regressor, Random Forest Regressor, Gradient Boosting Regressor, AdaBoost Regressor, and K-Nearest Neighbors (KNN) Regressor. To ensure a comprehensive evaluation, three aspects were analyzed for each algorithm: (i) the alignment between predicted and actual values, (ii) the distribution of errors, and (iii) the time-series-like trend between forecast and observation curves.

Table 1. Comparative graphical evaluation of regression models for flow prediction.

![](images/page_8_chart_4.jpg)

According to the results, the Extra Trees Regressor stands out as the most successful model. Its predictions almost perfectly overlap with the actual values, the error distribution forms a centered and narrow bell-shaped curve, and the time series plots confirm a very close match between observed and estimated flow values. This demonstrates the high generalization capability of the model.

The Random Forest Regressor also exhibited high predictive accuracy; however, peripheral deviations were more noticeable compared to Extra Trees, and its error distribution was slightly asymmetric, indicating reduced stability in certain regions of the data. Gradient Boosting Regressor performed moderately well by capturing the overall patterns of the dataset, yet it showed systematic deviations in specific segments, highlighting a tendency toward bias in localized areas.

On the other hand, AdaBoost Regressor produced wide error ranges, asymmetric residuals, and large fluctuations in the time series comparisons, suggesting that it is not a suitable method for this dataset. Finally, the KNN Regressor exhibited the weakest performance. Its scatter plots revealed high variance and poor alignment with actual values, while the error distribution was broad and inconsistent, reflecting the algorithm’s sensitivity to local data structures and its limited capacity to handle complex non-linear relationships.

Taken together, these findings confirm that tree-based ensemble methods, particularly the Extra Trees algorithm, are highly robust alternatives for nonlinear and multidimensional regression problems in asphalt mixture design. The graphical comparisons in Table 1 provide additional evidence that these methods not only achieve higher accuracy but also produce more stable and interpretable prediction behaviors than boosting or instance-based algorithms.

According to the quantitative metrics obtained from the actual and predicted flow (mm) values in Table 2, the Extra Trees Regressor model showed the highest success among the regression algorithms tested. This model showed an almost perfect prediction performance by reducing the mean absolute error (MAE) to approximately zero $( 4 . 0 6 \times 1 0 ^ { - 1 5 } )$ the mean squared error (MSE) to $2 . 4 7 \times 1 0 ^ { - 2 9 }$ , and the root mean square error (RMSE) to $4 . 9 7 \times 1 0 ^ { - 1 5 }$ . The accuracy (%accuracy) of the model is 99.999%, which indicates an extraordinary success in terms of both explanatory and predictive power. The subsequent Random Forest and Gradient Boosting models stand out as strong alternatives with 90.18%, respectively. While the MAPE values of these models remained below $8 \% ,$ their RMSE values were in the 0.35–0.36 band. However, AdaBoost Regressor and KNN Regressor models performed poorly with both higher error rates and lower explanatory coefficients. While the AdaBoost model showed borderline generalization ability, the KNN model was able to reach low values. These findings indicate that tree-based ensemble methods, especially the Extra Trees algorithm, offer superior performance in terms of predictive power compared to other models and should be preferred for high variance and complex data.

Table 2. Flow value prediction metric values.

| Algorithms and Metrics | MAE | MSE | MAPE | RMSE | Accuracy | Training Time (s) |
| --- | --- | --- | --- | --- | --- | --- |
| Extra Trees | 4.0589 × 10-15 | 2.4750 × 10-29 | 1.0924 × 10-15 | 4.9749 × 10-15 | 99.9999 | ~0.5 |
| Random Forest | 0.2932 | 0.1245 | 0.0873 | 0.3529 | 91.2602 | ~2.5 |
| Gradient Boosting | 0.2838 | 0.1341 | 0.0819 | 0.3662 | 91.8046 | ~4.0 |
| AdaBoost | 0.7427 | 0.6814 | 0.2338 | 0.8254 | 76.6195 | ~3.0 |
| KNN | 0.7978 | 0.9215 | 0.2411 | 0.9599 | 75.8898 | ~0.1 |

To better understand the forecasting decisions of the Extra Trees Regressor model developed in this study, the SHAP (SHapley Additive Explanations) method was applied. SHAP analysis allows us to evaluate the contribution of each input to the model output in terms of both magnitude and direction. The SHAP summary plot obtained through the analysis is shown in Figure 4 and shows that the most significant inputs in flow (mm) predictions are sd0.15, sd2.36, softening point, and practical specific gravity Dp $( \mathrm { g r } / \mathrm { c m } ^ { 3 } ) ,$ respectively. It was found that high values of these inputs made a positive contribution to the model prediction, while low values had a negative effect. In particular, the prediction power of physically significant variables such as fine aggregate fractions (e.g., sd0.15) and softening point (softening point) shows that the model successfully reflects not only statistical but also engineering-based relationships.

![](images/page_10_chart_3.jpg)

Figure 4. SHAP for flow prediction.

## 2.1.2. First Dataset Stable Prediction

In Figure 5, it can be observed that the augmented data shown with orange dots and the original data shown with dark blue dots exhibit similar vectorial orientations, partially overlapping and forming similar intensity profiles. Especially in the first component direction, the density centers of the data points are close to each other, which shows that the augmented data statistically successfully mimic the structure of the original data space. This shows that the augmentation method can preserve both multidimensional feature correlations and distributional structure. In addition, the augmented data span a wider PCA space, reflecting the potential of the model to diversify the data space and generate probabilistic examples that can contribute to the overall learning process.

The graphical comparison in Figure 6 between the original and CTGAN-generated datasets indicates that the synthetic data replicates the overall distributional behavior of most variables with a reasonable degree of fidelity. For the coarse aggregate fractions (sd37.5, sd25.4, sd19, sd12.5, sd9.5), the synthetic distributions are largely consistent with the original ones, demonstrating similar central tendencies and overlapping density curves, with only minor deviations at the distribution tails. Intermediate fractions such as sd4.75 and sd2.36 show a satisfactory match in general shape, although the synthetic data appear slightly more concentrated around peak values, leading to reduced variability compared to the original dataset. Fine aggregate fractions (sd0.425, sd0.18, sd0.075) also display good alignment, albeit with sharper peaks in the synthetic data, which suggests that CTGAN tends to smooth variability while preserving the main trend.

![](images/page_11_chart_3.jpg)

Figure 5. PCA graph for stable values.

For engineering properties such as penetration, softening point, and specific gravity, the synthetic data successfully follow the distributional patterns of the original dataset, maintaining both central values and spread. Flow and volumetric parameters $( \mathrm { V _ { h } , V M A } ,$ VFA) reveal somewhat greater differences, with the synthetic distributions showing a narrower range, yet still capturing the essential structure of the original measurements.

Overall, the visual analysis confirms that CTGAN can generate synthetic datasets that are broadly consistent with the original distributions. While some reduction in variability and slight shifts at distribution tails are observed, the synthetic data reproduces the essential statistical and physical characteristics of the original dataset, supporting their use in subsequent modeling and predictive tasks.

The red line is the distribution of the synthetic data and the black line is the smoothed probability density (PDD) curve showing the distribution of the original data. The performance of different machine learning algorithms (Extra Trees, Gradient Boosting, Random Forest, AdaBoost and KNN) for predicting the Marshall stability value was evaluated based on three main visual metrics: the distribution between actual and predicted values, the error distribution graph, and time-series-like comparative prediction-observation curves. As a result of the graphical analyses shown in Table 3, the Extra Trees Regressor model was found to perform with much higher accuracy and low bias compared to the other algorithms due to the almost perfect alignment of the prediction values on the reference line and the concentration of the error distribution in a single bar with zero center. The Gradient Boosting and Random Forest models produced stable results, especially at medium–high accuracy levels, but their error distributions were more diffuse and asymmetric. The AdaBoost and KNN models, on the other hand, have noticeably higher error ranges and poor prediction accuracy, which is supported by both an increase in deviations in the prediction graph and a wider spectrum of error distributions. As a result, the Extra Trees algorithm has shown the strongest performance in terms of accuracy, consistency, and low error, and it is recommended as a highly reliable method for engineering-oriented continuous variable regression problems such as stability prediction.

![](images/page_12_chart_2.jpg)

Figure 6. Comparison of original and synthetic data distributions.

In line with the results shown in Table 4, the Extra Trees Regressor model has demonstrated almost perfect prediction performance by providing 100% accuracy with absolute zero error (MAE: 0.0000, MSE: 0.0000, RMSE: 0.0000) in all metrics. This is graphically supported by both linearly aligned prediction-observation points and singular centered error distribution. The Gradient Boosting Regressor model performed very satisfactorily with an accuracy of 93.17%, and the mean absolute error (MAE: 70.32) was within acceptable limits. The Random Forest Regressor, on the other hand, provided a strong explanatory power, but its accuracy decreased relatively due to the increase in RMSE (110.62) and MAE (87.33) values. On the other hand, the AdaBoost and K-Nearest Neighbors (KNN) models performed poorly both visually and numerically, especially in the KNN model, where the RMSE reached a high value of 304.42, indicating that the model moved away from predictive stability.

Table 3. Stability estimation and error scatter plots.

![](images/page_13_chart_4.jpg)

Table 4. Stability value prediction metric values.

| Algorithms and Metrics | MAE | MSE | MAPE | RMSE | Accuracy | Training Time (s) |
| --- | --- | --- | --- | --- | --- | --- |
| Extra Trees | 0.0000 | 0.0000 | 0.0000 | 0.000 | 100.00 | ~0.7 |
| Gradient Boosting | 70.3200 | 6966.8836 | 0.0682 | 83.4678 | 93.1784 | ~4.0 |
| Random Forest | 87.3338 | 12,236.6526 | 0.0896 | 110.6194 | 91.0333 | ~2.5 |
| AdaBoost | 192.7387 | 48,327.8172 | 0.2108 | 219.8358 | 78.9120 | ~3.0 |
| KNN | 237.8159 | 92,671.8688 | 0.2614 | 304.4205 | 73.8516 | ~0.1 |

Error metrics used to evaluate the success of machine learning algorithms are used to measure how well the models perform. These metrics help to assess how well a model’s predictions match the true values and the generalization ability of the model. Table 2 shows the comparative results of the R2, MSE, MAE, RMSE, and accuracy metrics of the 5 different machine learning models.

The mean absolute error (MAE) is a metric that shows how close the predicted values are to the true values. This metric is calculated by Equation (1).

$$
M A E \; = \; \frac { 1 } { n } { \sum _ { r \; = \; 1 } ^ { n } \left| P _ { d } ^ { r , m } - P _ { d } ^ { r , c } \right| }\tag{1}
$$

The root mean square error (RMSE) was chosen to compare the prediction errors of the different trained models. The closer the RMSE value is to $0 ,$ the better the predictive ability of the model in terms of its absolute deviation. The RMSE value is calculated by Equation (2).

$$
R M S E \; = \; \sqrt { \frac { 1 } { n } { \sum _ { r \; = \; 1 } ^ { n } } \big ( P _ { d } ^ { r , m } - P _ { d } ^ { r , c } \big ) ^ { 2 } }\tag{2}
$$

Here, n denotes the total number of observations, yi represents the actual (observed) $\mathrm { y _ { i } }$ values, and $\hat { y } _ { i }$ indicates the values predicted by the model. MAPE calculates the average of the absolute percentage errors by taking the ratio of prediction errors to the actual values and expressing the result as a percentage. This characteristic makes MAPE a more intuitive and interpretable measure for understanding the error rate of a model. The MAPE value is calculated by Equation (3).

$$
MAPE \; = \; \frac{100}{n} \mathrm{\sum}_{i \; = \; 1}^{n} \left| \frac{y_i - \hat{y_i}}{y_i} \right|\tag{3}
$$

MSE assesses the quality of an estimator. The MSE metric is calculated by Equation (4).

$$
M S E \; = \; { \frac { 1 } { n } } { \sum _ { r \; = \; 1 } ^ { n } } { \left( P _ { i } - P _ { i } ^ { \prime } \right) ^ { 2 } }\tag{4}
$$

According to the results shown in Figure $^ { 7 , }$ void ratio between aggregate grains (VM) stands out as the most dominant input of the model, and high VM values have a strong negative effect on the predicted stability. Variables representing aggregate size distributions such as sd4.75, sd9.5, and sd2.36 make significant contributions to the model with different positive and negative effects. Physical parameters such as percentage of void in the mixture $\mathrm { ( V _ { h } ) }$ and practical specific gravity $\mathbf { D _ { \mathrm { p } } }$ also have a significant effect on the model output, indicating that the model makes decisions consistent with physical reality. On the other hand, the low SHAP contribution values of parameters representing binder characteristics such as softening point, penetration, and bitumen $W _ { \mathrm { a } }$ indicate that these variables play a secondary role in stability prediction.

![](images/page_15_chart_2.jpg)

**Figure 7.** SHAP for stability prediction.

## 2.1.3. Second Dataset Flow Estimation

In this study, data augmentation was performed on Marshall test data of asphalt mixtures, and the statistical consistency of the augmented samples was visualized by Principal Component Analysis (PCA). The original dataset consists of only 30 samples, which limits the generalization capacity of machine learning models. To overcome this deficiency, the dataset was increased to 125 samples by applying a CTGAN (Conditional Tabular GAN)- based synthetic data generation method. The two-dimensional projection plot obtained from the PCA analysis shows, in Figure 8, that the original and synthetic data largely overlap each other. The augmented data (orange dots) are consistent with the distribution of the original data but spread over a larger area. This shows that the data augmentation method is successful in increasing the variation. In particular, the data augmentation process extends the distribution of the original data towards more diverse and different points while maintaining its distribution around the center point. Most of the augmented data follows the distribution of the original dataset and shows a natural variation. This demonstrates the capacity of the synthetic data generation technique to successfully generate new data while preserving the structure of the data. As a result, it can be concluded that the synthetic data generation method successfully represents the original data distribution, increases the variation, and preserves the structural integrity of the dataset.

The graphical comparison in Figure 9 between the original and CTGAN-generated datasets indicates that the synthetic data generally follows the main distributional patterns of the original measurements. In the coarse aggregate fractions (sd37.5, sd25.4, sd19, sd12.5, and sd9.5), the synthetic dataset successfully reproduces the central tendencies, with density curves showing close alignment and only minor deviations at the distribution tails. For intermediate sieve sizes such as sd4.75, sd2, and sd0.425, the overlap between the two datasets remains substantial, although the synthetic data exhibit a slightly narrower spread, suggesting reduced variability compared to the original. In finer fractions (sd0.18, sd0.075), the general trends are preserved, but the synthetic distributions are more peaked, pointing to a concentration around the mean values.

When engineering properties are considered, the results show that the CTGAN model provides a satisfactory approximation. The softening point, penetration, and flow variables display synthetic curves that track the original distributions reasonably well, with consistent central values and comparable ranges. Similarly, parameters such as specific gravity, practical specific gravity (Dp), and bitumen content demonstrate strong alignment, confirming that the synthetic data retain key material characteristics. For volumetric properties (Vh, VMA, VFA), the synthetic dataset captures the overall shapes of the original distributions, reflecting the main behavioral patterns, although slight differences in spread are visible.

![](images/page_16_chart_3.jpg)

Figure 8. PCA graph for second dataset flow values.

Overall, the comparison highlights that the CTGAN-generated dataset can maintain the essential distributional structures of the original data across both aggregate gradation and mechanical performance variables. While some deviations exist in terms of variance and distribution tails, the synthetic data broadly reproduces the original dataset and can be considered suitable for subsequent modeling and analysis.

The graphs presented in Table 5 compare the performance of different regression models (‘Extra Trees’, ‘Random Forest’, ‘Gradient Boosting’, ‘AdaBoost’ and ‘KNN’) in predicting the ‘flow’ value in the Marshall tests. Firstly, when the Extra Trees model is analyzed, it is clearly seen that the predictions are quite close to the real values, so the model shows high performance. In the ‘Predicted and Real Values’ graph, it is noteworthy that the points are mostly clustered around a linear line. The irregularity of the error distribution in the ‘Fault Distribution’ graph and the presence of extreme values indicate that there are some outliers in the predictions. The ‘Predicted and Real Graph’ shows that the predictions successfully capture the general trend, but there are occasional deviations. The Random Forest model also shows a strong relationship between actual and predicted values. The predictions seem to be located quite close and offer similar high accuracy to the Extra Trees model. However, the error distribution graph reveals that the errors are distributed more symmetrically and with lower variance compared to the Extra Trees model and are more consistent in this context. The time series graph clearly shows that the predictions follow a course close to the actual values. The Gradient Boosting model also provided high accuracy compared to Extra Trees and Random Forest. The linear structure in the ‘Predicted and Real Values’ graph shows that the prediction ability of the model is strong. The error distribution graph shows that the errors are generally concentrated around zero, but there are still some deviations. The time series graph reveals that the model is particularly effective in modeling small-scale fluctuations. The AdaBoost model showed weaker performance compared to the other models. The ‘Predicted and Real Values’ graph has a disorganized appearance. There is a weak linear relationship between predicted values and actual values. The wide distribution in the error scatter plot indicates that the predictions have significant deviations. In the time series plot, the forecasts frequently deviate from the actual values. This indicates that the AdaBoost model is not adequate for this data set. Finally, the KNN model seems to have the lowest performance among the analyzed models. The scatter plot of the predicted and actual values is highly irregular and scattered, with no clear linear relationship. The error distribution plot shows a wide distribution and high error values. In addition, the time series plot reveals that the predictions often deviate significantly from the actual values. In the light of these findings, it can be said that the KNN model is not suitable for this study.

![](images/page_17_chart_3.jpg)

Figure 9. Comparison of original and synthetic data distributions.

**Table 5.** Flow prediction and error scatter plots for the second dataset.

| G Boosting AdaBoost KNN Predictions Values Predictions Values Predictions Values 2。 3.0 2 2 3.2 2.8 2.25 2.50 3.75 o 2 36 2 00 .00 Real Valu 2.75 00 3.25 3.75 3.75 4.00 Frequency Frequency 0.0 25 2 on 1.5 2 2 Fault Distribut Fault Di Fault Valu aph 0.050 0.07 Measurement Prediction-Calculated Point Value Mea asurement Prediction-Calculated Point Value ent Prediction -Calculated Point Value 3.25 2.25 3.00 50 o0 2.00 0 > 2 os o0 2 os 0 os Real Values - Real Predictions (AdaBoostRegressor) (KNN) 2 2 |
| --- |

In conclusion, the Extra Trees, Random Forest, and Gradient Boosting models provide high accuracy and consistency for predicting the ‘flow’ value in the Marshall test, while AdaBoost and especially the KNN model perform poorly.

Table 6 shows the performance results of the prediction models for the ‘flow’ value using the second data set. The table is analyzed in terms of MAE (mean absolute error), MSE (mean square error), MAPE (mean absolute percentage error), RMSE (root mean square error), and accuracy metrics, which evaluate the performance of various regression algorithms. The Extra Trees model showed almost perfect results. The MAE, MSE, and RMSE values are very small $( 3 . 6 5 9 2 \times 1 0 ^ { - 1 5 } , 1 . 6 4 2 4 \times 1 0 ^ { - 2 9 }$ , and $4 . 0 5 2 6 \times 1 0 ^ { - 1 5 }$ , respectively), and the accuracy value is 99.9999%. This shows that the Extra Trees algorithm learnt the structural relationships in the dataset perfectly. The Gradient Boosting model performed very well and was the second most successful model after the Extra Trees model. The low error values for MAE (0.0344), MSE (0.0019), and RMSE (0.0445) and the high accuracy rate (98.7531%) show that the model is very successful. The Random Forest model performed well, but significantly lower than the Gradient Boosting and Extra Trees algorithms. The MAE (0.0996), MSE (0.0230), and RMSE (0.1517) values increased, and the accuracy (96.4698%) values decreased. This shows that the Random Forest algorithm captures some variations in the dataset less than other models. The AdaBoost model provided moderate performance. The MAE (0.1593), MSE (0.0353), and RMSE (0.1880) values increased, and the accuracy rate decreased to 94.0977%; therefore, it can be seen that the prediction power of the model is limited. The KNN model showed the lowest performance. The error metrics of this model increased significantly (MAE: 0.23326, MSE: 0.0830, RMSE: 0.28822), and the accuracy (91.5982%) decreased significantly. These results show that the KNN algorithm does not have a good prediction capability in the analyzed dataset.

Table 6. Flow value prediction metric values for the second dataset.

| Algorithms and Metrics | MAE | MSE | MAPE | RMSE | Accuracy |
| --- | --- | --- | --- | --- | --- |
| Extra Trees | 3.6592 e-15 | 1.6424 e-29 | 1.3376 e-15 | 4.0526 e-15 | 99.9999 |
| Gradient Boosting | 0.0344 | 0.0019 | 0.0124 | 0.04450 | 98.7531 |
| Random Forest | 0.0996 | 0.02300 | 0.03530 | 0.15167 | 96.4698 |
| AdaBoost | 0.1593 | 0.0353 | 0.05902 | 0.1880 | 94.0977 |
| KNN | 0.23326 | 0.0830 | 0.08401 | 0.28822 | 91.5982 |

SHAP analysis explains which attributes a model gives more “weight” when making decisions. This analysis is used to reveal the “black box” nature of the model and to make decision processes transparent. The graph in Figure 10 is also very valuable from an engineering perspective, as it can be understood which material or physical parameters affect the flow performance more. The horizontal axis is the SHAP value. A positive SHAP value indicates that the input increases the “slow” estimate; a negative SHAP value indicates that it decreases the estimate. Each point represents a data sample. The color scale indicates whether the value of the relevant variable is high (pink) or low (blue).

Percentage of void in the mixture $\mathrm { V _ { h } }$ is the most effective feature in the model’s prediction. High values in this feature (pink dots) have positive SHAP values in the direction of increasing flow value. This shows that higher $\mathrm { V _ { h } }$ values are associated with higher flow (flow) values by the model. Parameters such as bitumen $W _ { \mathrm { a } }$ as percentage by weight of aggregate and bitumen filled void ratio VFA $( \mathrm { V _ { f } } )$ also play an important role in the predictions. Variables in lower ranks such as sd37.5, softening point, and sd25.4 are the parameters that contribute less to the model’s prediction. The graph given in Figure 6 provides both the internal model explainability in terms of determining the basic physical parameters affecting the performance of asphalt mixtures and reveals which parameters are more critical for optimization in engineering applications. In the studies, it was determined that particular parameters such as $\nabla _ { \mathbf { h } } ,$ bitumen content, and VFA have a large effect on the model output; it is predicted that improvements focusing on these parameters can positively affect the flow performance.

When comparing SHAP results between the original and augmented datasets, it was observed that the ranking of the most critical variables remained largely consistent.

Parameters such as $\nabla _ { \mathbf { h } } ,$ VFA, and softening point maintained their dominant influence across both datasets, confirming their robust role in stability and flow prediction. However, minor shifts in the importance of gradation parameters (e.g., sd0.15, sd2.36) were detected in the augmented dataset, which suggests that data expansion can highlight secondary factors that might otherwise be masked in smaller samples.

![](images/page_20_image_3.jpg)

Figure 10. SHAP for second dataset flow prediction.

## 2.1.4. Second Dataset Stability Estimation

The graph presented in Figure 11 shows the projection of the original and augmented (synthetic) data in two-dimensional space with PCA (Principal Component Analysis). PCA provides dimensionality reduction by determining the directions where the variance in multidimensional data is highest. When the visual results are examined, it is observed that the augmented data (orange) generally successfully follows the original data distribution (blue), and the concentration especially occurs in a similar way in the upper right region. This situation shows that the data augmentation method (probably CTGAN-based) provides statistical consistency by largely preserving the real data structure. However, it is noteworthy that some original examples (in the upper left—outlier) are located separately from the distribution, and these extreme points are not covered by the synthetic data. This situation shows that the synthetic data generation mechanism cannot adequately represent the extreme values, and the data augmentation strategy focuses on the central distribution. As a result, the PCA projection reveals that the augmented data is successful in terms of similarity to the original data structure, but careful evaluation should be made for extreme cases.

The comparative histograms and density plots illustrate the alignment between the original dataset and the CTGAN-generated synthetic dataset across all variables. In the figure, the original data are shown with blue histograms and black density curves, while the synthetic data are represented with orange histograms and red density curves. For the first variable, only density curves are displayed (black for original and red for synthetic) to emphasize the degree of overlap without the influence of histogram binning.

The results demonstrate, in Figure 12, that the synthetic dataset generally preserves the statistical structure of the original data. For the coarse aggregate fractions (sd37.5, sd25.4, sd19), the synthetic distributions closely match the original, with overlapping density curves and nearly identical central tendencies. Intermediate fractions such as sd4.75 and sd2.36 also show strong agreement, although the synthetic curves tend to be more peaked, suggesting reduced variability. Fine fractions (sd0.425, sd0.18, sd0.075) present the most noticeable deviations: while the overall shape is preserved, the synthetic distributions are narrower and more concentrated around mean values, indicating a loss of variance.

![](images/page_21_chart_3.jpg)

Figure 11. PCA graph for second dataset stability values.

In engineering properties (softening point, specific gravity, bitumen content), the synthetic dataset reproduces the general distributional patterns of the original data, maintaining similar means and ranges. However, in parameters such as penetration and flow, the synthetic distributions appear more centralized, with fewer extreme values compared to the original. This indicates that while CTGAN is effective at capturing the overall tendencies, it struggles to reproduce the full variability and tail behavior of the original data.

Table 7 presents the performance of different regression algorithms (Extra Trees, Random Forest, Gradient Boosting, AdaBoost, KNN) in predicting the “stability” values for the second data set, compared with the triple graph set. The “Predicted and Real Values” graphs show the linear fit between the predicted and real values; the “Fault Distribution Graph” shows the distribution of errors; and the “Predicted and Real Graph” shows the overlap of the two datasets in a time-series-like trend. As a result of the analysis of the graphs in Table 7, it is observed that Extra Trees and Random Forest algorithms in particular produce predictions closer to the real values, and the error distributions are centrally located. On the other hand, the AdaBoost and KNN models both exhibit more irregular error distributions and create serious deviations between the prediction curves and the real value curves. This situation shows that the Extra Trees and Random Forest models provide high prediction performance, while the others provide lower accuracy in terms of flow prediction.

Table 8 compares the performance metrics of various regression algorithms for “stability” estimation using the second dataset. The Extra Trees model provided the highest performance in terms of MAE (109.52), MSE (22701.69), RMSE (150.67), and 90.45% accuracy, demonstrating both low error values and high stability in its predictive success. The Random Forest model also performed strongly, yielding slightly higher error values (MAE: 113.74, MSE: 23567.89, RMSE: 153.52) and an accuracy of 90.12%. Although its performance was close to Extra Trees, the marginal increase in error rates indicates a relatively lower precision.

Gradient Boosting ranked just behind these two algorithms, with an MAE of 116.91, an MSE of 24499.47, an RMSE of 156.52, and an 89.91% accuracy. While it captured the general patterns effectively, its wider error spread suggested reduced robustness. AdaBoost showed the weakest performance, with the highest error rates across all metrics, particularly an RMSE of 173.77 and an accuracy of only 88.36%, confirming that it is not suitable for stability value estimation. The KNN model performed better than AdaBoost, with an MAE of 128.30 and an RMSE of 158.50, but its accuracy (89.04%) and relatively higher variance indicated limited predictive capability.

![](images/page_22_chart_3.jpg)

Figure 12. Comparison of original and synthetic data distributions.

Table 7. Stability estimation and error scatter plots for the second dataset.

| G Boosting AdaBoost KNN Predictions Values Predictions Values Predictions Valu 1300 1150 1200 1250 0:0 0:0 2:0 1250 0:0 0 110 1000 00 1600 1600 0 0 Fault Dis lt Distribution Graph ribution Gr 200 100 200 00 00 ement Prediction-Calculated Point Value Mei rediction-Calculated Point Value 10 1400 20 0:0 0 00 0:0 00 0 00 0 (KNN) |
| --- |

In conclusion, the Extra Trees and Random Forest algorithms emerged as the most reliable methods for stability estimation, with Extra Trees showing a slight edge in accuracy and consistency. By contrast, AdaBoost and KNN exhibited lower reliability, confirming that tree-based ensemble approaches are more appropriate for engineering applications requiring robust stability prediction.

The red line is the distribution of the synthetic data and the black line is the smoothed probability density (PDD) curve showing the distribution of the original data.

The summary graph in Figure 13 shows the sensitivity of the Extra Trees Regressor model trained to predict the “stability” value to various attributes. The graph presents the SHAP values for each attribute and the effect of the original values of the attributes simultaneously.

Table 8. Second dataset stability value prediction metric values.

| Algorithms and Metrics | MAE | MSE | MAPE | RMSE | Accuracy |
| --- | --- | --- | --- | --- | --- |
| Extra Trees | 109.5188 | 22,701.6953 | 0.0954 | 150.6708 | 90.4500 |
| Gradient Boosting | 116.9175 | 24,499.4725 | 0.1009 | 156.5230 | 89.9088 |
| Random Forest | 113.7421 | 23,567.8942 | 0.0987 | 153.5231 | 90.1200 |
| AdaBoost | 138.9588 | 30,194.6274 | 0.1163 | 173.7660 | 88.3616 |
| KNN | 128.3040 | 25,121.5839 | 0.1095 | 158.4978 | 89.0426 |

![](images/page_24_chart_5.jpg)

Figure 13. SHAP for second dataset stability prediction.

The softening point feature at the top is the most dominant variable in the model’s judgement. High softening point values (pink color) correspond to positive SHAP values, indicating that they contribute to increased stability predictions. This is followed by the inter-aggregate void ratio, VMA, and penetration, which also have a significant effect on predictions. It is observed that high values of these variables generally have a positive effect. Variables related to the fine fractions of the aggregate (e.g., sd12.5, sd0.18, sd2) show a moderate effect, while variables such as sd37.5, sd19, and practical specific gravity Dp $( \mathrm { g r } / \mathrm { c m } ^ { 3 } )$ in the lower ranks have a very low contribution to the model’s decision. The horizontal axis in the graph represents the SHAP value, i.e., the contribution of each feature to the model output. The further away the SHAP value is, the more influence it has. The colors of the dots represent the magnitude of the variable value (pink: high value, blue: low value).

From an academic point of view, this graph provides transparency of the decisionmaking mechanism of the model, while at the same time, from an engineering point of view, it helps to determine the physical parameters affecting the “stability” value. In particular, the softening point, VMA, and penetration have strong effects on the modeled stability. Therefore, it is recommended to carefully optimize these parameters in asphalt mix design.

The SHAP-based feature rankings presented in this study not only reveal statistical importance but also offer practical insights for asphalt mixture formulation. For instance, the consistent dominance of parameters like $\mathrm { V _ { h } }$ (voids in mixture) and VFA (bitumen-filled voids) in flow predictions implies that increasing the air void content while ensuring adequate bitumen saturation could directly improve flexibility and workability in the field. Similarly, the high influence of the softening point and penetration on stability predictions suggests that bitumen selection with appropriate thermal characteristics can enhance deformation resistance, particularly under high-temperature conditions. Based on these findings, practitioners may consider adjusting the binder content, modifying aggregate gradation, or choosing binders with specific softening characteristics to target desired performance outcomes. Thus, SHAP not only enhances model interpretability but serves as a decision-support framework for formulation optimization. An error comparison according to RMSE values shown in Figure 14.

![](images/page_25_chart_4.jpg)

![](images/page_25_chart_5.jpg)

Figure 14. Error comparison according to RMSE values.

The graph on the left shows that an appropriate scale was used for models with relatively small RMSE values. Extra Trees is by far the best model, with zero error. Gradient Boosting and Random Forest produce similar results, while AdaBoost and KNN produce higher errors. The graph on the right shows that it is suitable for scenarios with large RMSE values. Extra Trees again stands out with zero errors, while the errors of the other models increase progressively and peak in the KNN model. Both graphs clearly show that the Extra Trees model performs with significantly lower errors than all other methods. The high error rates of models such as KNN and AdaBoost emphasize the superiority of the recommended model.

## 3. Discussion

The findings of this study provide comprehensive answers to the proposed research questions and support the validation or rejection of the stated hypotheses.

RQ1. Can the Marshall stability and flow values of asphalt mixtures be predicted with high accuracy using machine learning algorithms?

The results demonstrate that the proposed machine learning models, particularly the Extra Trees Regressor, achieved outstanding prediction performance for both flow and stability values. For instance, in the flow estimation using the first dataset, the Extra Trees model yielded a near-zero MAE $( 4 . 0 6 \times 1 0 ^ { - 1 5 } )$ and an RMSE of $4 . 9 7 \times 1 0 ^ { - 1 5 }$ , with 99.9999% accuracy. Similarly, the model showed superior performance for the second dataset, confirming that these parameters can indeed be predicted with remarkable precision. This confirms the effectiveness of machine learning for predictive modeling in asphalt mixture design.

RQ2. Does CTGAN-based synthetic data augmentation improve the generalization performance of predictive models developed on small datasets?

PCA visualizations and performance metrics confirm that CTGAN-generated data successfully preserved the statistical distribution of the original datasets. The augmentation process led to more balanced data structures and reduced overfitting risks, thereby enhancing the models’ generalization ability. Particularly, the overlap observed in the PCA plots between the synthetic and original data supports this conclusion. This confirms the utility of CTGAN for enriching small datasets in materials science applications.

RQ3. Can SHAP effectively reveal the internal decision mechanisms of the machine learning models and provide engineering-relevant interpretations?

SHAP analyses provided transparent insights into feature contributions, enabling the identification of parameters with the highest impact on model outputs. For instance, in flow prediction, variables such as Vh, VFA, and Wa were consistently highlighted, while softening point and VMA played critical roles in stability prediction. These results are consistent with asphalt mixture design principles, confirming SHAP’s ability to bridge statistical outputs with engineering logic. Thus, SHAP successfully fulfilled its role as an explainability tool and engineering decision aid.

RQ4. What are the most influential physical and mechanical parameters in predicting Marshall flow and stability, and how do these factors vary across different datasets?

Across both datasets, parameters related to void content (Vh, VFA), binder characteristics (softening point, penetration, Wa), and aggregate gradation (sd0.15, sd2.36, sd12.5) emerged as dominant features in the predictions. While some variation in importance ranking was observed depending on dataset structure, the consistency of core influencing factors across models validated their engineering significance. This confirms that a subset of parameters consistently governs the mechanical behavior of asphalt mixtures.

RQ5. Do the predictive performances of models trained on two distinct datasets differ significantly in terms of error metrics and importance of features?

While both datasets yielded high-accuracy models, the original dataset (larger sample) showed slightly more stable error metrics due to its size. However, models trained on the CTGAN-augmented second dataset maintained comparable performance, showing no significant drop in accuracy. The feature importance rankings derived from the SHAP analysis were generally consistent across datasets, supporting the robustness of the modeling framework. Thus, although minor differences exist, both datasets support valid and interpretable model performance. The evaluation of the hypotheses is shown in Table 9.

Table 9. Hypothesis evaluation.

| Hypothesis | E | valuation Justification |
| --- | --- | --- |
| H1 (CTGAN preserves statistical distribution) | ✓ | PCA plots and distribution analyses Accepted confirmed structural integrity between original and synthetic data. |
| H1 (Extra Trees performs better than other models) | ✓ | It achieved the lowest error rates and Accepted highest accuracy across all tasks compared to other regressors. |
| H1 (SHAP aligns with engineering logic) | ✓ | SHAP consistently identified engineering-relevant parameters as Accepted most influential, enhancing model interpretability. |

Although the Extra Trees Regressor achieved near-zero error rates in certain tasks, this performance should be interpreted with caution. The results reflect the homogeneous nature of the dataset and the effectiveness of CTGAN-based augmentation but may not fully generalize to broader or more heterogeneous conditions.

The SHAP results identified void ratios (Vh, VFA) and softening points as the most influential parameters in stability and flow predictions. From an engineering perspective, this finding is consistent with the fundamental behavior of asphalt mixtures. A higher air void ratio (Vh) generally increases permeability and reduces resistance to deformation, which explains its strong negative SHAP contribution to stability. Similarly, voids filled with asphalt (VFA) indicate the binder’s ability to occupy the mixture structure, directly affecting both durability and load distribution capacity. The softening point of the binder, on the other hand, represents its temperature susceptibility; binders with higher softening points tend to perform better under elevated temperatures by resisting rutting, which aligns with their strong positive SHAP impact. Thus, the SHAP analysis not only confirms the statistical importance of these parameters but also provides a mechanistic explanation that supports their engineering significance in asphalt mixture design.

From a practical perspective, these SHAP findings directly inform asphalt mix design decisions. The high importance of void ratios (Vh and VFA) suggests that careful control of air voids and binder content is essential for optimizing durability and load-bearing capacity. Similarly, the role of the softening point highlights the need to select binders with appropriate thermal stability to minimize rutting at higher service temperatures. The comparison between datasets further indicates that while augmented data provides a broader representation of parameter interactions, the fundamental engineering drivers of performance remain consistent. This reinforces the reliability of SHAP as a decision-support tool in practical mix design.

The comparative results indicate that while the Extra Trees and Random Forest models provide the most accurate predictions, their practical utility lies in large-scale mix design optimization tasks, where robustness and generalization are required. Gradient Boosting, although less accurate, offers balanced performance and computational efficiency, making it suitable for iterative design processes. KNN, despite its lower accuracy, may still serve as a simple baseline model for laboratory-scale applications with limited variability. Moreover, the correlation analysis—supported by PCA clustering and SHAP contributions—showed that parameters such as Vh and VFA are strongly interdependent, which is consistent with their combined role in determining mixture durability and resistance. The softening point, likewise, was consistently highlighted as a key driver of performance, reinforcing its importance in binder selection decisions.

## Limitations

Both datasets used in this study were obtained from laboratory measurements or CTGAN-based synthetic augmentation methods based on statistically similar distributions. Therefore, the models have not been tested on completely independent third-party datasets or data reflecting highly heterogeneous distributions. This situation may limit the external generalizability of the models to other real-world conditions, such as different geographical locations, bitumen sources, aggregate types, or binder modification technologies. Despite efforts to increase the diversity of the dataset by modifying the granulometric structure, the datasets still operate within a relatively limited design space. The absence of out-of-distribution (OOD) validation is an area where the dataset needs to be developed further, particularly in cases where conditions deviate significantly from the training regime (e.g., extreme climate conditions or rare material combinations).

It should be noted that the near-perfect results obtained with the Extra Trees model are likely influenced by the limited variability and relatively small size of the dataset. While CTGAN-based augmentation reduced this limitation, the risk of overfitting remains, and future work should validate the models on larger and more diverse real-world datasets.

## 4. Conclusions

In this study, regression-based machine learning algorithms were used to estimate the stability and flow values of Marshall samples used in hot-mix asphalt mixtures, and their performances were compared in detail. In particular, the Extra Trees Regressor algorithm stood out as the most successful model with high accuracy and low error for both target variables. For example, in flow estimation, the Extra Trees model showed perfect estimation success with almost zero MAE and RMSE values in both the first and second datasets. In terms of stability estimation, the Extra Trees algorithm again left all other models behind with $\mathrm { M A E } = 1 0 9 . 5 1 8 8$ and $\mathrm { R M S E } = 1 5 0 . 6 7 0 8$ values. On the other hand, the Random Forest and Gradient Boosting models generally produced satisfactory results but fell behind the Extra Trees model in terms of accuracy and error metrics. In addition, the explainability analyses obtained with the SHAP method in the study revealed that the most important variables affecting model decisions were physical and binding properties such as softening point, VMA, penetration, $\nabla _ { \mathbf { h } } ,$ and bitumen $W _ { \mathbf { a } } .$ In this context, the models provided not only statistical estimation but also engineering interpretable outputs. Comparison table of similar studies shown in Table 10.

Table 10. Comparison table of similar studies.

| Works | Year | Algorithms | Metrics |
| --- | --- | --- | --- |
| [46] | 2011 | CRIM, Rayleigh | Core Error = 0.1 |
| [47] | 2021 | Extra Trese, Gradient Boosting, Support Vector Regressor, Bagging | R<sup>2</sup> = 0.916 |
| [48] | 2022 | Support Vector Regressor, Decision Tree, Random Forest, ANN, AdaBoost, Gradient Boosting | R<sup>2</sup> = 0.947 |
| [49] | 2023 | Support Vector Machine, Logistic Regression, K-Nearest Neighbors | Acc = 97% |
| [50] | 2024 | Support Vector Regressor, Backpropagation Neural Network | R<sup>2</sup> = 0.990 |
| [51] | 2025 | Neural Network Regression, Linear Regression, Bayesian Ridge Regression, Support Vector Regressor, Decision Tree Regressor, Random Forest Regressor, Gradient Boosting Regressor, K-Nearest Neighbors Regressor | R<sup>2</sup> = 0.897 |
| This Work | 2025 | Extra Trees, Random Forest, Gradient Boosting, AdaBoost, K-Nearest Neighbors Regressor | Acc = 0.999 |

Overall, this study shows that CTGAN-based data augmentation significantly improves model performance on small datasets, the Extra Trees algorithm can be considered as a powerful tool for asphalt mixture design by providing superior performance in highvariance regression problems, and SHAP explanations can provide reliability in engineering terms by making the decision structure of the model transparent. For these reasons, it is recommended to use integrated artificial intelligence models with both explainability and augmented data support in data-based approaches for optimization of physical systems such as asphalt mixture design.

The results of the SHAP analysis not only provide statistical insight into feature importance but also offer practical guidance for asphalt mixture design. For example, the consistent importance of the softening point and VMA parameters in both stability and flow predictions suggests that optimizing the binder stiffness and air void content can directly enhance deformation resistance and flexibility of asphalt layers. Similarly, features like Vh (voids in the mixture) and Vf (bitumen-filled voids), which appear as dominant predictors in flow estimation, are directly linked to workability, compaction characteristics, and durability of asphalt in field applications. These findings imply that machine learning outputs can be used as decision-support tools in determining optimal gradation, binder content, and compaction targets during formulation. Therefore, the SHAP-based model interpretation not only enhances transparency but also contributes to engineering decision-making by highlighting the physical parameters that most influence critical performance targets.

Given the increasing adoption of AI-based decision support systems in civil engineering, the models developed in this study have strong potential to be integrated into real-time asphalt design tools and laboratory workflows. The low-latency nature of ensemble-treebased regressors like Extra Trees and the interpretability afforded by SHAP values make them suitable for use in the following:

Asphalt mix design software to dynamically suggest optimal binder/aggregate combinations based on user-defined performance priorities.

Laboratory quality control systems, where SHAP-based dashboards can help technicians understand which physical properties are driving deviations in stability or flow.

Pavement management systems (PMS) that seek to optimize life-cycle performance by adjusting design parameters based on regional material properties and environmental profiles.

**Author Contributions:** R.G.: Conceptualization, review and editing, XAI Algorithms, software. K.M.E.: Validation, writing—original draft preparation, methodology. All authors have read and agreed to the published version of the manuscript.

**Funding:** This research received no external funding.

**Data Availability Statement:** The data that support the findings of this study will be made available from the corresponding author upon reasonable request.

**Conflicts of Interest:** The authors declare no conflicts of interest.

## References

1. Kök, B.V.; Yalçın, E.; Yılmaz, M.; Büyük, B. Investigation of conventional and rheological properties of bitumen modified with Selenizza natural asphalt. J. Fac. Eng. Archit. Gazi Univ. 2024, 39, 921–932.

2. Jiang, Q.; Chen, M.; Zhao, Y.; Wu, S.; Fan, Y.; Gan, Z.; Zhang, Y. Comprehensive assessment of the durability deterioration of asphalt pavement in salt environment: A literature review. Case Stud. Constr. Mater. 2022, 17, e01706. [[CrossRef](https://doi.org/10.1016/j.cscm.2022.e01706)]

3. Yilmaz, M.; Kök, B.V.; Kuloğlu, N. Effects of using asphaltite as filler on mechanical properties of hot mix asphalt. Constr. Build. Mater. 2011, 25, 4279–4286. [[CrossRef](https://doi.org/10.1016/j.conbuildmat.2011.04.072)]

4. Rochlani, M.; Falla, G.C.; Caro, S.; Leischner, S.; Wellner, F. Understanding the influence of temperature and frequency on the fatigue resistance of bitumen. Constr. Build. Mater. 2021, 296, 123754. [[CrossRef](https://doi.org/10.1016/j.conbuildmat.2021.123754)]

5. Kırbaş, U.; Sözen, E.; Genç, Z. Sıcak Asfalt Karışımlarında Filler Olarak Kullanılan Farklı Kireçlerin Kaplama Performansına Etkilerinin İncelenmesi. J. Inst. Sci. Technol. 2023, 13, 1043–1054.

6. Loaiza, A.; Colordo, H.A. Marshall stability and flow tests for asphalt concrete containing electric arc furnace dust waste with high ZnO contents from the steel making process. Constr. Build. Mater. 2018, 166, 769–778. [[CrossRef](https://doi.org/10.1016/j.conbuildmat.2018.02.012)]

7. Fadhil, T.H.; Ibrahim, R.K.; Fathullah, H.S. The Influence of Curing Methods on Marshall Stability and Flow. IOP Conf. Ser. Mater. Sci. Eng. 2020, 671, 012132. [[CrossRef](https://doi.org/10.1088/1757-899X/671/1/012132)]

8. Tapkın, S. Optimal polypropylene fiber amount determination by using gyratory compaction, static creep and Marshall stability and flow analyses. Constr. Build. Mater. 2013, 44, 399–410. [[CrossRef](https://doi.org/10.1016/j.conbuildmat.2013.02.060)]

9. Özpınar, E.T. Nanosilika’nın Bitüm ve Bitümlü Sıcak Karışımların Özelliklerine Etkisinin Araştırılması. Master’s Thesis, Inonu University, Institute of Science, Battalgazi, Turkey, 2019; 110p.

10. Hınıslıoğlu, S.; Ağar, E. Use of waste high density polyethylene as bitumen modifier in asphalt concrete mix. Mater. Lett. 2004, 58, 267–271. [[CrossRef](https://doi.org/10.1016/S0167-577X%2803%2900458-0)]

11. Güneş, H. Ankara İlinde Bitümlü Sıcak Karışım Kaplamalı Yollarda Kullanılan Agregaların Uygunluklarının Belirlenmesi ve Çok Kriterli Karar Verme Yöntemleri ile Sınıflandırılması. Master’s Thesis, Konya Technical University, Graduate Education Institute, Konya, Türkiye, 2019; 124p.

12. Ertaş, M.A. Asfalt Betonu Aşınma Tabakalarında Kazınmış Asfalt Kaplama Malzemelerinin Yeniden Kullanım Etkinliğinin ve Performansının Araştırılması. Master’s Thesis, Aksaray University, Institute of Science, Aksaray, Türkiye, 2019; 121p.

13. Kuloğlu, M. Bitümlü Sıcak Karışımlard Bitüm Film Kalınlığının Stabilite ve Rijitliğe Etkisi. Master’s Thesis, Fırat University, Institute of Science, Elazığ, Türkiye, 2006; 121p.

14. Ahmad, J.; Rahman, M.Y.A.; Hainin, M.R.; Hossain, M. Comparative evaluation of hot-mix asphalt design methods. Int. J. Pavement Eng. 2011, 13, 89–97. [[CrossRef](https://doi.org/10.1080/10298436.2011.565765)]

15. Praba, M.; Lokeshwaran, K.; Kumar, S.R. An Optimum Design Approach For Flexible Pavement Using Asphalt Institute Method. Int. J. Civ. Eng. Technol. 2020, 11, 146–157. [[CrossRef](https://doi.org/10.34218/IJCIET.11.3.2020.016)]

16. Ghuzlan, K.A.; Al-Mistarehi, B.W.; Al-Momani, A.S. Rutting performance of asphalt mixtures with gradations designed using Bailey and conventional Superpave methods. Constr. Build. Mater. 2020, 261, 119941. [[CrossRef](https://doi.org/10.1016/j.conbuildmat.2020.119941)]

17. Namlı, R.; Kuloğlu, N. Superpave ve Marshall Yöntemlerinin Deneysel Karşılaştırılması. İMO Tek. Dergi 2007, 18, 4103–4118.

18. Geçkil, T.; Seloğlu, M.; İnce, C.B. Sıcak Karışım Asfalt Kaplamanın Su Hasarı Direnci Üzerinde RET Katkısının Etkisi. Fırat Üniversitesi Müh. Bil. Derg. 2021, 33, 537–546. [[CrossRef](https://doi.org/10.35234/fumbd.880528)]

19. Kök, B.V.; Kuloğlu, N. Effects of Steel Slag Usage as Aggregate on Indirect Tensile and Creep Modulus of Hot Mix Asphalt. G.U. J. Sci. 2008, 21, 97–103.

20. Oreto, C.; Russo, F.; Veropalumbo, R.; Viscione, N.; Biancardo, S.A.; Dell’Acqua, G. Life Cycle Assessment of Sustainable Asphalt Pavement Solutions Involving Recycled Aggregates and Polymers. Materials 2021, 14, 3867. [[CrossRef](https://doi.org/10.3390/ma14143867)]

21. Bi, Y.; Huang, J.; Pei, J.; Zhang, J.; Guo, F.; Li, R. Compaction characteristics assessment of Hot-Mix asphalt mixture using Superpave gyratory compaction and Stribeck curve method. Constr. Build. Mater. 2021, 285, 122874. [[CrossRef](https://doi.org/10.1016/j.conbuildmat.2021.122874)]

22. Yüca, Y. Superpave ve Marshall Tasarım Yöntemlerinin Karşılaştırılması. Master’s Thesis, Ataturk University, Institute of Science, Erzurum, Türkiye, 2011; 102p.

23. Zeiada, W.; Liu, H.; Ezzat, H.; Al-Khateeb, G.G.; Underwood, B.S.; Shanableh, A.; Samari, M. Review of the Superpave performance grading system and recent developments in the performance-based test methods for asphalt binder characterization. Constr. Build. Mater. 2022, 319, 126063. [[CrossRef](https://doi.org/10.1016/j.conbuildmat.2021.126063)]

24. Gul, M.A.; Islam, M.K.; Awan, H.H.; Sohail, M.; Al Fuhaid, A.F.; Arifuzzaman, M.; Qureshi, H.J. Prediction of Marshall Stability and Marshall Flow of Asphalt Pavements Using Supervised Machine Learning Algorithms. Symmetry 2022, 14, 2324. [[CrossRef](https://doi.org/10.3390/sym14112324)]

25. Shah, S.A.R.; Anwar, M.K.; Arshad, H.; Qurashi, M.A.; Nisar, A.; Khan, A.N.; Waseem, M. Marshall stability and flow analysis of asphalt concrete under progressive temperature conditions: An application of advance decision-making approach. Constr. Build. Mater. 2020, 262, 120756. [[CrossRef](https://doi.org/10.1016/j.conbuildmat.2020.120756)]

26. Upadhya, A.; Thakur, M.S.; Sihag, P. Predicting Marshall Stability of Carbon Fiber-Reinforced Asphalt Concrete Using Machine Learning Techniques. Int. J. Pavement Res. Technol. 2024, 17, 102–122. [[CrossRef](https://doi.org/10.1007/s42947-022-00223-5)]

27. Asi, I.; Alhadidi, Y.I.; Alhadidi, T.I. Predicting Marshall stability and flow parameters in asphalt pavements using explainable machine-learning models. Transp. Eng. 2024, 18, 100282. [[CrossRef](https://doi.org/10.1016/j.treng.2024.100282)]

28. Upadhya, A.; Thakur, M.S.; Sharma, N.; Sihag, P. Assessment of Soft Computing-Based Techniques for the Prediction of Marshall Stability of Asphalt Concrete Reinforced with Glass Fiber. Int. J. Pavement Res. Technol. 2022, 15, 1366–1385. [[CrossRef](https://doi.org/10.1007/s42947-021-00094-2)]

29. Jalota, S.; Suthar, M. Modelling of Marshall stability of polypropylene fibre reinforced asphalt concrete using support vector machine and artificial neural network. Int. J. Transp. Sci. Technol. 2024. [[CrossRef](https://doi.org/10.1016/j.ijtst.2024.08.001)]

30. Awan, H.H.; Hussain, A.; Javed, M.F.; Qui, Y.; Alrowais, R.; Mohamed, A.M.; Fathi, D.; Alzahrani, A.M. Predicting marshall flow and marshall stability of asphalt pavements using multi expression programming. Buildings 2022, 12, 314. [[CrossRef](https://doi.org/10.3390/buildings12030314)]

31. Mistry, R.; Roy, T.P. Predicting Marshall stability and flow of bituminous mix containing waste fillers by the adaptive neuro-fuzzy inference system. Rev. De La Construcción 2020, 19, 209–219. [[CrossRef](https://doi.org/10.7764/rdlc.19.2.209-219)]

32. Gupta, R.; Yadav, A.K.; Jha, S.K. Harnessing the power of hybrid deep learning algorithm for the estimation of global horizontal irradiance. Sci. Total Environ. 2024, 943, 173958. [[CrossRef](https://doi.org/10.1016/j.scitotenv.2024.173958)]

33. Singh, S.K.; Jha, S.K.; Gupta, R. Comparative Analysis Between Bi-LSTM and Uni-LSTM Algorithms for Wind Speed Estimation. In Proceedings of the 2023 7th International Conference on Computer Applications in Electrical Engineering-Recent Advances (CERA), Roorkee, India, 27–29 October 2023; pp. 1–6.

34. Ganvir, C.; Dinesh, D.; Gupta, R.; Jha, S.K.; Raghuvanshi, P.K. Prediction of Global Horizontal Irradiance based on eXplainable Artificial Intelligence. In Proceedings of the 2024 International Conference on Intelligent and Innovative Technologies in Computing, Electrical and Electronics (IITCEE), Bangalore, India, 24–25 January 2024; pp. 1–4.

35. Jha, A.; Goel, V.; Kumar, M.; Kumar, G.; Gupta, R.; Jha, S.K. An efficient and interpretable stacked model for wind speed estimation based on ensemble learning algorithms. Energy Technol. 2024, 12, 2301188. [[CrossRef](https://doi.org/10.1002/ente.202301188)]

36. Bharti, K.; Singh, S.K.; Jha, S.K.; Gupta, R. Modelling and simulation of solar water pump using arduino uno in Proteus. In Proceedings of the 2023 International Conference on Intelligent and Innovative Technologies in Computing, Electrical and Electronics (IITCEE), Bengaluru, India, 27–28 January 2023; pp. 774–781.

37. Mohamed, A.; Mahmood, S. K-Nearest Neighbors Approach to Analyze and Predict Air Quality in Delhi. J. Artif. Intell. Metaheuristics 2025, 9, 34–43. [[CrossRef](https://doi.org/10.54216/JAIM.090104)]

38. El-Sayed, M.E. A Review of Machine Learning Models for Predicting Air Quality in Urban Areas. Metaheuristic Optim. Rev. 2025, 3, 33–46. [[CrossRef](https://doi.org/10.54216/MOR.030204)]

39. Salamai, A.A.; El-kenawy, E.M.; Abdelhameed, I. Dynamic Voting Classifier for Risk Identification in Supply Chain 4.0. Comput. Mater. Contin. 2021, 69, 3749–3766. [[CrossRef](https://doi.org/10.32604/cmc.2021.018179)]

40. El-Kenawy, E.S.M.; Khodadadi, N.; Mirjalili, S.; Abdelhamid, A.A.; Eid, M.M.; Ibrahim, A. Greylag goose optimization: Natureinspired optimization algorithm. Expert Syst. Appl. 2024, 238, 122147. [[CrossRef](https://doi.org/10.1016/j.eswa.2023.122147)]

41. Alhussan, A.A.; Khafaga, D.S.; El-Kenawy, E.S.M.; Ibrahim, A.; Eid, M.M.; Abdelhamid, A.A. Pothole and plain road classification using adaptive mutation dipper throated optimization and transfer learning for self driving cars. IEEE Access 2022, 10, 84188–84211. [[CrossRef](https://doi.org/10.1109/ACCESS.2022.3196660)]

42. Gupta, R.; Yadav, A.K.; Jha, S.; Pathak, P.K. Comparative analysis of advanced machine learning classifiers based on feature engineering framework for weather prediction. Sci. Iran. 2024, 1–28. [[CrossRef](https://doi.org/10.24200/sci.2024.61305.7242)]

43. Kasanagh, S.H.; Ahmedzade, P.; Günay, T. Polimer Katkılı Bitümlü Sıcak Karışımların İzmir Hava Durumu Şartlarındaki Marshall Stabilite Performansının İncelenmesi. AKU J. Sci. Eng. 2021, 21, 1157–1166. [[CrossRef](https://doi.org/10.35414/akufemubid.890079)]

44. Güzel, İ.; Benli, A. Geleneksel bitümlü sıcak karışım üstyapı tabakalarının dinamik rijitlik modülünün tahmini ve Marshall dizayn yöntemi verileriyle karşılaştırılması. DUJE (Dicle Univ. J. Eng.) 2022, 13, 339–349.

45. İskender, E. Koşullandırma Sistemlerinin Geleneksel ve Modifiye Asfalt Karışımlar Üzerindeki Etkilerinin Araştırılması. Ph.D. Thesis, Karadeniz Technical University, Institute of Science, Trabzon, Türkiye, 2008; 166p.

46. Leng, Z.; Al-Qadi, I.L.; Lahouar, S. Development and validation for in situ asphalt mixture density prediction models. NDT E Int. 2011, 44, 369–375. [[CrossRef](https://doi.org/10.1016/j.ndteint.2011.03.002)]

47. Rahman, S.; Bhasin, A.; Smit, A. Exploring the use of machine learning to predict metrics related to asphalt mixture performance. Constr. Build. Mater. 2021, 295, 123585. [[CrossRef](https://doi.org/10.1016/j.conbuildmat.2021.123585)]

48. Liu, J.; Liu, F.; Zheng, C.; Zhou, D.; Wang, L. Optimizing asphalt mix design through predicting effective asphalt content and absorbed asphalt content using machine learning. Constr. Build. Mater. 2022, 325, 126607. [[CrossRef](https://doi.org/10.1016/j.conbuildmat.2022.126607)]

49. Yu, S.; Shen, S. Compaction prediction for asphalt mixtures using wireless sensor and machine learning algorithms. IEEE Trans. Intell. Transp. Syst. 2022, 24, 778–786. [[CrossRef](https://doi.org/10.1109/TITS.2022.3218692)]

50. Fan, X.; Lv, S.; Xia, C.; Ge, D.; Liu, C.; Lu, W. Strength prediction of asphalt mixture under interactive conditions based on BPNN and SVM. Case Stud. Constr. Mater. 2024, 21, e03489. [[CrossRef](https://doi.org/10.1016/j.cscm.2024.e03489)]

51. Al-Ammari, M.; Dong, R.; Nasser, M.; Al-Maswari, A. Innovative machine learning approaches for predicting the asphalt content during Marshall design of asphalt mixtures. Materials 2025, 18, 1474. [[CrossRef](https://doi.org/10.3390/ma18071474)]

**Disclaimer/Publisher’s Note:** The statements, opinions and data contained in all publications are solely those of the individual author(s) and contributor(s) and not of MDPI and/or the editor(s). MDPI and/or the editor(s) disclaim responsibility for any injury to people or property resulting from any ideas, methods, instructions or products referred to in the content.