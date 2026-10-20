<!--
SOURCE: 原始 PDF: reference/背景知识/2021-International Journal of Pavement Research and Technology-Effectiveness Evaluation of Preventive Maintenance Treatments on Asphalt Pavement Performance Using LTPP Data.pdf | 页数: 16 | 集合: reference
题录: litfull-017 Effectiveness Evaluation of Preventive Maintenance Treatments on Asphalt Pavement Performa (DOI: 10.1016/j.conbuildmat.2020.118585)
提取: MinerU markdown 全文（可重建索引的真相源副本；images/ 不入 corpus）
-->
**ORIGINAL RESEARCH PAPER**

![](images/page_0_image_3.jpg)

# Effectiveness Evaluation of Preventive Maintenance Treatments on Asphalt Pavement Performance Using LTPP Data

**Xiaohua Luo**<strong><sup>1</sup></strong> **· Feng Wang**<strong><sup>1</sup></strong>  **· Haitao Gong**<strong><sup>1</sup></strong> **· Jueqiang Tao**<strong><sup>1</sup></strong> **· Xin Qiu**<strong><sup>2</sup></strong> **· Ningning Wang**<strong><sup>3</sup></strong>

Received: 2 February 2021 / Revised: 10 May 2021 / Accepted: 6 July 2021 / Published online: 22 July 2021 © The Author(s), under exclusive licence to Chinese Society of Pavement Engineering 2021

## Abstract

Preventive maintenance (PM) has been a pavement asset management strategy widely used by many highway agencies to improve pavement conditions, restore pavement serviceability, retard deterioration, and prolong pavement life. Practical experience shows that the effectiveness of different kinds of PM treatments varies for different distresses in short-term pavement performance which is related to the long-term pavement performance. The objective of this study is to evaluate the effectiveness of PM treatments in short-term asphalt pavement performance using the Specific Pavement Studies (SPS-3) data of the Long-Term Pavement Performance (LTPP) Program. The PM treatments included in the study were chip seal, crack seal, slurry seal, and thin overlay, and the related SPS-3 data were retrieved from LTPP for the study. Longitudinal cracking, transverse cracking, alligator cracking, roughness, and rutting were employed as indicators to evaluate possible pavement performance improvements. Statistical methods were applied to compare the effectiveness of PM treatments in terms of the performance indicators of longitudinal cracking, transverse cracking, alligator cracking, roughness, and rutting. In addition, mixed-effects logistic regression was conducted to find the significant influential factors and quantify the influence of various factors such as temperature, precipitation, cloud cover, subgrade material, truck traffic, and asphalt concrete layer thickness on the improvements of pavement performance. The analysis results showed that chip seal and thin overlay have most sig nificant effects on short-term cracking improvements. Thin overlay has the best effect on short-term roughness and rutting improvements. As of influential factors, temperature, cloud cover, and subgrade material are significantly important factors in PM treatments. These results may provide performance data enabled understanding of the effectiveness of PM treatments.

**Keywords** Preventive maintenance · Asphalt pavement · Effectiveness · Pavement performance · Influential factor · LTPP

## 1 Introduction

A pavement preservation program aims to use a set of integrated and cost-effective maintaining practices to extend pavement life, improve traffic safety, and meet motorists’ expectations [1]. Preventive maintenance (PM) is one of the primary components in any pavement preservation program, and is typically applied to pavements when the pavements are still in relatively good condition with a significant amount of remaining service life. A PM applies cost-effective treatments to the surface or near-surface of structurally sound pavements, and mainly serves to prolong the pavement life by alleviating pavement functional deterioration without the requirement of enhancing pavement structure [2]. Currently, various PM treatments have been employed by highway transportation agencies to restore pavement serviceability and retard future deterioration [3]. The practical experience has indicated that a PM is a costeffective investment by its effectiveness in improving ride quality, increasing customer satisfaction, and extending the service lives of pavements [4].

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">\* Feng Wang f\_w34@txstate.edu</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">Ningning Wang ningning.wang@jsums.edu</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">Xiaohua Luo x\_l33@txstate.edu</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">Ingram School of Engineering, Texas State University, 601 University Drive, San Marcos, TX 78666, USA</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">Haitao Gong h\_g153@txstate.edu</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">Jueqiang Tao j\_t552@txstate.edu</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">Xin Qiu xqiu@zjnu.cn</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">2 Road and Traffic Engineering Institute, Zhejiang Normal University, No.688 Yingbin Road, Jinhua 321004, Zhejiang, China</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">3 Department of Mathematics and Statistical Sciences, Jackson State University, 1400 John R. Lynch St, Jackson, MS 39217, USA</span></small>

At present, the most widely used PM treatments are thin hot mix asphalt overlay, crack sealing, microsurfacing, and different asphalt sealing coats (e.g., chip seal/seal coat, slurry seal) [1, 3–5]. Each PM treatment has its primary functional attributes and applicability to some distresses. National Cooperative Highway Research Program (NCHRP) Report No. 523 summarized the characteristics of PM treatments [3]. For example, a crack seal can address longitudinal cracking and transverse cracking. The treatment has no structural benefit and is effective only when the extent of cracking is minimal and there is little-to-no structural problem. Crack sealing may not reduce alligator cracking or high severity rutting [3, 5]. Microsurfacing is primarily used to inhibit ravelling and oxidation of the pavement surface, and it is also effective at improving surface friction and filling minor irregularities and wheel ruts [3, 5]. A slurry seal can address longitudinal cracking and transverse cracking at low severity level. It has no structural capac ity, but can temporarily seal cracks at low severity level. Slurry sealing may not reduce significant alligator cracking or deep rutting [3, 5, 6]. A chip seal can address longitudinal cracking, transverse cracking, and low severity roughness. A chip seal is also effective in sealing alligator cracking at medium severity level in comparison with other treatments. Chip seals may not reduce deep rutting or cracking of high severity level [3, 5, 7, 8]. A thin overlay can address roughness, rutting, and longitudinal cracking and transverse cracking at low severity level, but it may not reduce alligator cracking or cracking at high severity level [3, 5, 9]. Previous studies also employed general statistical methods, regression models, survival analysis, etc. to compare the effectiveness of the PM treatments on mitigating pavement distresses, and the results showed that the effectiveness of PM treatments varies on different pavement distresses [10–12]. Therefore, the effectiveness evaluation of different PM treatments on each kind of pavement distress would be needed to support decision-making in the selection of an appropriate PM treatment for a pavement distress.

Several research efforts have been invested in evaluating the effectiveness of PM treatments. The Specific Pavement Studies (SPS) SPS-3 for flexible pavements from the Long-Term Pavement Performance (LTPP) Program have been conducted since 1990 to analyze the effectiveness of treatments in prolonging the life of pavement and share information and experience among highway agencies and industry [13]. The pavement performance indicators in the SPS-3 experiments include cracking, roughness, and rutting. Based on these indicators, various criteria and methods are being used to evaluate the effectiveness of PM treatments. For example, analyses and models for simple ranking, performance jump, and deterioration reduction rate for short-term effectiveness, overall condition index with multiple regression, service life extension of pavements, area bounded by performance curve, and weighted distress were used in past studies [6, 14–18]. Among these research, the short-term effectiveness analyses of the PM treatment are crucial, because short-term maintenance performance models have strong applicability to long-term evaluation of maintenance effectiveness. These short-term maintenance performance models can be used by the pavement management operators to determine the expected incremental change of pavement condition as a result of a future application of any specific maintenance treatment [18]. Therefore, this study employed the short-term pavement performance in terms of longitudinal cracking, transverse cracking, alligator cracking, roughness, and rutting as indicators to evaluate the effectiveness of the PM treatments. These research results have revealed that thin overlay is the most effective PM treatment, followed by chip seal, and slurry seal [2, 11, 19]. In contrast, crack seal does not have as good long-term effectiveness as the other PM treatments [2, 20].

Actually, differences in effectiveness of PM treatments could be caused by many influential factors, such as traffic, climate in construction, and structure [2, 6, 19, 21, 22]. The ASTM special technical publication (STP-1348) required that the PM treatment selected for a section of pavement should consider the condition of the existing pavement, the traffic volumes using the pavement, and the environmental conditions [23]. This study employed mixed-effects logistic regression to quantify the potentially influential factors of the effectiveness of PM treatments on specific pavement performance indicators for short-term performance. The mixed-effects logistic regression model is a generalized linear mixed model with a logistic link function, which has been broadly adopted in various practical areas for influential factor analyses, including maintenance decisions, pavement deterioration, and preventive maintenance scheduling decisions [24–26].

## 2  Background

## 2.1  Long‑Term Pavement Performance (LTPP) Program

The LTPP program was started in the late 1980s to study pavement performance and its influential factors. The goal of the LTPP program is to satisfy researchers’ needs of (1) collecting research-quality pavement information data to develop better performance prediction models in pavement design and management; (2) gaining a better understanding of the effects of many variables on pavement performance; and (3) testing new techniques for pavement design, construction, maintenance, and rehabilitation [27]. More than 2,500 pavement test sections have been established on in-service public highways and roadways throughout North America [28]. These pavement sections have been constructed using highway agency specifications and subjected to the same traffic loads and environmental conditions as other pavements in the highway system. A broad range of data is collected from LTPP test sections based on past and current engineering principles of pavement performance, distress development, load factors, and construction/ maintenance effects [28]. The SPS-3 sections from the LTPP program were studied to develop regression models for the effectiveness evaluation of pavement PM treatments in mitigating longitudinal cracks and selection of the best and worst treatments for use under varying conditions [10]. Khattak and Alrashidi [29] employed the SPS-3 sections to assess the ranking and effectiveness of PM treatments, and found that the chip seals and the crack seals had the highest and the lowest overall performance ranks, respectively. This study used the pavement sections from SPS-3 (Preventive Maintenance Effectiveness of Flexible Pavements) to compare the effectiveness by which the selected maintenance treatments preserve and extend pavement service life, safety, and ride quality. The factors for the flexible pavements in SPS-3 included climatic condition, subgrade type, traffic loading, initial condition, and structural adequacy.

## 2.2  Preventive Maintenance

To satisfy the requirement of enhancing pavement conditions without significant budget increase, highway agencies are paying more attention to PM. As a planned strategy of cost-effective treatments to an existing roadway system, PM can preserve the asset value, retard future deterioration, and maintain or improve the functional condition of the system [1]. Hence, a PM treatment before aggravated deterioration commences is an alternative from both finance and safety perspectives. Highway agencies have seen the importance of managing a sound preventive pavement maintenance program, which aims to preserve existing pavements and prevent major deterioration to roadways, so that the pavement surface may sustain its designed loading with extended life at a reduced life-cycle cost [30]. A considerable amount of literature about preventive maintenance treatment analysis has been published, and these studies investigated the effectiveness, cost, influencing factors, etc. of the PM treatments [2, 9, 14, 19, 20]. These studies have revealed that different PM treatments varied on addressing different distresses for pavements, and the most effective treatment was not always the most cost-effective treatment. Meanwhile, FHWA requested “Applying the right treatment to the right road at the right time”, and therefore, a PM treatment must be carefully selected and applied when the pavement is still in good condition.

Hicks et al. [31] developed decision trees to select the proper maintenance strategies from crack seals, fog seals, slurry seals, microsurfacings, chip seals, and thin overlays. Chang et al. [32] analyzed the cost-effectiveness of thin overlays, slurry seals, crack seals, and chip seals using a multiple criteria decision-making method. Jia et al. [12] evaluated the short-term effectiveness of thin overlays, slurry seals, chip seals, and crack seals using statistical methods. The PM treatments considered in this study were chip seal, crack seal, slurry seal, and thin overlay for flexible pavements. The characteristics of these PM treatments are summarized as follows [33–35]:

Chip seal is the most common surface treatment for low-volume roads. It is a spray application of asphalt binder immediately covered by a single layer of onesized aggregates. The typical cost is \$0.90–\$1.08 per m<sup>2</sup> (\$1.08–\$1.30 per year<sup>2</sup>). The expected life of a chip seal is 4–7 years.

Crack seal is an application of sealing material directly in the cracks of the pavement surface to prevent the entry of water or other non-compressible substances such as sand, dirt, rocks, or weeds. The typical cost is \$1.00– \$5.00 per linear meter. The expected life of a crack seal is 2–6 years.

• Slurry seal is a mixture of quick setting asphalt emulsion, fine aggregate, mineral filler, additive, and water. The typical cost is \$0.84–\$1.14 per m<sup>2</sup> (\$1.00–\$1.36 per year<sup>2</sup>). The expected life of a slurry seal is 3–5 years.

Thin overlay is similar to conventional overlays except that the thickness is 5.08 cm or less. The typical cost is \$2.09–\$2.39 per m<sup>2</sup> (\$2.50–\$2.86 per year<sup>2</sup>). The expected life of a thin overlay is 7–10 years.

## 2.3  Influential Factor of Preventive Maintenance

It has been noted that a PM treatment may not always have the expected effectiveness in pavement performance improvement. Climate, traffic, and initial pavement conditions are involved as influential factors to evaluate the different effects of PM treatments in fixing specific distresses [3]. Numerous studies have attempted to investigate what factors could impact the effectiveness of different PM treatments and further tried to explain how these factors influence treatment effectiveness [36]. For instance, it is widely recognized that weather-related factors are often responsible for the failure of a newly constructed seal coat, because seal coat performance depends on the evaporation in an emulsion for developing the desired adhesive characteristics. A manual for emulsion-based seal coats from the NCHRP recommended that application temperature should be within a range to provide uniform transverse and longitudinal spraying, but should not exceed $8 5 ~ ^ { \circ } \mathbf { C }$ [8]. PM construction during or shortly after precipitation can cause the PM project to fail, apparently due to the decrease in temperature and increase in moisture [7]. Many research results have shown the importance of including influence factors in the analysis of pavement performance under PM treatments. For example, Hall et al. analyzed the influences of factors such as climate, pavement structures, traffic, and pretreatment on the effectiveness of the PM treatments in SPS-3 with respect to long-term pavement performance of IRI, rutting, and fatigue cracking, and the results showed that annual average precipitation was an important factor for long-term IRI and rutting [19]. Amarasiri and Muhunthan [10] quantified the effectiveness of different PM treatments under different climatic (annual average precipitation, annual average temperature, and annual average freeze index), traffic (annual average daily traffic and annual average daily truck traffic), and pavement (structural number, age since construction and age since treatment, and the magnitude of the last distress measured before treatment) conditions using SPS-3 section data. The results indicated that best-performing and worstperforming treatments vary under different conditions. Dong et al. [14] found that the factors of initial surface condition, subgrade types, annual precipitation range, annual freeze index traffic level, moisture level, structural capacity, and pretreatment IRI affected the effectiveness of PM treatments differently on different performance indicators. Therefore, it is essential to evaluate the influential factors of the PM treatments on generally accepted pavement indicators.

## 3  Methodology

## 3.1  Method for Effectiveness Analysis

In this study, roughness, rutting, longitudinal cracking, transverse cracking, and alligator cracking were selected as the performance indicators of PM treatments. The main idea of analyzing the effectiveness of different PM treatments in terms of each indicator was to compare the measurements of each indicator before and after a specific PM treatment. There were two ways defined for PM treatment effectiveness analysis, i.e., short-term performance change and long-term performance change. The short-term performance change is an initial effectiveness assessment. It was defined as the difference between the first measurement of the indictor after the testing PM treatment (post-treatment) and the last measurement of the same indicator before the testing PM treatment (pretreatment) [2, 14,

19]. If the short-term performance change is positive, which means that the pavement distress increases after the PM treatment, then the PM treatment can be identified as “non-effective.” Otherwise, the PM treatment is “effective”. The long-term performance change was used to evaluate the effectiveness of a PM treatments in a longer period of time. The long-term performance evaluation of a PM treatment can be assessed by comparing the change in pavement performance indicator measurements under the current PM treatment. Previous studies on long-term pavement performance data showed that the performance of a PM treatment such as seal coat tends to be stabilized only after a short period of service time [7]. Therefore, the evaluation of pavement performance change due to a PM treatment over a relatively short time window after the treatment could provide a reliable indication of the long-term pavement performance of the PM treatments.

## 3.2  Method for Factor Analysis

To investigate which influential factors may potentially impact the effectiveness of PM treatments improving the pavement performance, the binary logistic regression was employed. In the machine learning world, there are two types of algorithmic tacks. One is called regression (pre-dicting continuous values) and the other is called classification (predicting discrete values). The logistic regression applied in this study is a classification algorithm with a binary dependent variable of two possible values. The two values in the logistic regression model were labeled “0” and $\text{" }1 \text{" }$ , where $\text{" }0 \text{" }$ means the PM treatment “non-effective” and $\text{" }1 \text{" }$ means the treatment “effective.”

In the binary logistic regression model, the log odds of the outcome is modeled as a linear combination of the predictor variable. The binary logistic function is formulated as follows [24]:

$$
\ln ( \mathsf { o d d s } ) = \ln \left( { \frac { p ( y ) } { 1 - p ( y ) } } \right) = b _ { 0 } + b _ { 1 } x _ { 1 } + b _ { 2 } x _ { 2 } + \cdots + b _ { n } x _ { n } { = } x ^ { \prime } b _ { n }\tag{1}
$$

$$
\mathrm { o d d s } = \frac { p ( y ) } { 1 - p ( y ) } = e ^ { b _ { 0 } + b _ { 1 } x _ { 1 } + b _ { 2 } x _ { 2 } + \cdots + b _ { n } x _ { n } } ,\tag{2}
$$

where

| ln(odds) | Logit function or log odds, is the ${ \frac { p } { 1 { - } p } } ;$ logarithm of the odds |
| --- | --- |
| n | Is the number of predictor vari- ables |
| $x _ { i }$ | Is the ith predictor variable, $i = 1$ $2 , . . . , n$ |
| $y$ | Is the binary response variable for outcomes 1 or 0 |
| $p$ | Is the probability of y occurring |
| $b _ { 0 }$ | Is the interception coefficient |
| $b _ { i }$ | Is the regression coefficient of $x _ { i } ,$ $i = 1 , 2 , . . . , n$ |
| $x ^ { \prime }$ | Is the transposed vector consist- ing of 1 for the intercept, and all predictor variables $x_{1},x_{2},\cdots,x_{n};$ |
| $b$ | and Is the vector of coefficients $b _ { 0 } , b _ { 1 } , \cdots , b _ { n } .$ |

The odds is the ratio of the probability of an event occurring to the probability of the event not occurring, which can be applied to evaluate the odds of the analyzed event occurring by increasing one unit of the influential factor. A ratio of two such odds is called Odds Ratio, which can be used to compare two odds values.

The potentially influential factors adopted in this study included numerical variables and categorical variables. To handle such complexity, mixed-effects logistic regression can be used to model the binary outcome variables. The categorical variables can be treated as random effects in the dataset and the numerical variables can be treated as fixed effects. The mixed-effects logistic regression model could involve one or more numerical and categorical influential factors to determine binomial distribution outcomes [37]. Therefore, the log odds of the outcome in the mixed-effects logistic model can be modeled as a linear combination of the predictor variables when data are clustered or there are both fixed and random effects. The mixed-effects logistic function is as follows [24]:

$$
\ln ( \mathrm { o d d s } ) = \ln \left( { \frac { p ( y ) } { 1 - p ( y ) } } \right) = x ^ { \prime } b + z ^ { \prime } \beta , \quad \beta \; \sim \; N ( 0 ,   \sigma ^ { 2 } ) ,\tag{3}
$$

where

z′ is the transposed vector of the explanatory variables for the random effects;

𝛽 is the vector of regression coefficients for the random effects.

The traditional linear regression model requires data following a normal distribution. However, the Generalized Linear Model (GLM) does not require normal distributions (but need the distribution of the residuals to be close enough to a normal distribution). The logistic regression can be seen as a special case of the GLM, and thus, there is no need to normalize the data before performing logistic regressions. The model was estimated and fitted using the maximum-likelihood estimation (MLE) technique to satisfy the modeling requirements.

## 4  Data Preparation

The data used in this study were from SPS-3 with the four typical PM treatments including chip seal, crack seal, slurry seal, and thin overlay. The pavement sections with the needed PM treatment performance data were retrieved from table “EXPERIMENT\_SECTION” in the LTPP database. The data included 105 sections with longitudinal cracking, transverse cracking, and alligator cracking measurements recorded in table “MON\_DIS\_AC\_REV”, 230 sections with roughness measurements recorded in table “MON\_HSS\_PROFILE SECTION”, and 215 sections with rutting measurements recorded in table “MON\_T\_PROF\_INDEX\_SECTION.” Table 1 shows more detail descriptions about the dataset.

## 4.1  Pavement Performance Indicator

The pavement performance data recorded in the LTPP database include pavement distresses and surface characteristics. In this study, three types of cracking (i.e., longitudinal cracking, transverse cracking, and alligator cracking), roughness, and rutting were selected as pavement performance indicators which are critical to traffic safety, riding quality, and integrity of pavement structure to evaluate the effectiveness of the four PM treatments. The three types of cracking have measurements at low, medium, and high severity levels. The longitudinal cracking includes wheel path (WP) measurements and non-wheel path (NWP) measurements representing different positions of the pavement. The transverse cracking includes transverse crack length and the numbers of transverse cracks at three severity levels. The total length of cracks at WPs was employed to evaluate the overall cracking condition on the pavement surface. The roughness indicators contain left WP roughness, right WP roughness, and mean roughness index (MRI). It should be pointed out that the roughness of the pavements after the placement of a chip seal or slurry seal will initially be rough due to the aggregate on the surface, but will get smoother to some degree as traffic wears off or embeds the aggregate further. However, the “smoothing out” trend is quite limited. Therefore, to be consistent with other performance indicators, this study still defined the difference between the first measurement of roughness after the testing PM treatment and the last measurement of roughness before the testing PM treatment as the short-term effectiveness indicator of roughness. The rutting indicators include average left half-lane depth from 1.8-m straight edge, average right half-lane depth from 1.8-m straight edge, and maximum average depth from 1.8-m straight edge.

Table 1   Dataset size for effectiveness analysis of PM treatments

|  | Chip seal | Crack seal | Slurry seal | Thin overlay | Total |
| --- | --- | --- | --- | --- | --- |
| Cracks/section | 21 | 45 | 21 | 18 | 105 |
| Roughness/section | 58 | 67 | 56 | 49 | 230 |
| Rutting/section | 54 | 72 | 48 | 41 | 215 |

## 4.2  Influential Factor

Influential factors from traffic, structure, and climate at construction were selected to analyze the possible impact on the effectiveness of the four PM treatments. The traffic element used in this study was the annual average daily truck traffic (AADTT). Subgrade material type and representative thickness of the AC layer were employed to illustrate the structural characteristics of the experimental sections. The climate elements came from the rainfall, temperature, and direct solar radiation, which included surface precipitation, daily air temperature, and average daily fraction of cloud cover of each experimental section in the PM treatment conducted month. The description of the influential factors is presented in Table 2.

## 5  Results and Analyses

## 5.1  Effectiveness Analysis

## 5.1.1  Statistical Analysis of Short‑Term Performance

Traditional statistical analysis was applied to calculate the mean and standard deviation (SD) for each performance indicator before and after a PM treatment. The results are shown in Table 3.

Comparing the pavement performance before and after the PM treatments, it is quite obvious that in most of the cases, pavement performance was improved due to the PM treatments. However, some PM treatments showed varied effects on the performance indicators at different severity levels. For example, thin overlay, chip seal, and slurry seal had significant effects on reducing the mean and SD of the WP longitudinal cracking at low severity level. Specifically, when the length of the low severity level longitudinal cracking decreased, the crack length of each pavement section became closer to the mean value with a lower variance. Conversely, with crack seal treatments, the mean and SD of the longitudinal cracking on WP at low severity level showed slight increases. All the four PM treatments had no significant effect on decreasing the WP longitudinal cracking at medium or high severity levels. These PM treatments had similar effects on NWP longitudinal cracking at three severity levels. For transverse cracking length, the number of transverse cracks, and alligator cracking at low severity level, thin overlays, and chip seals decreased the mean and SD values, but slurry seals and crack seals did not have such effects. For transverse cracking length, the number of transverse cracks, and alligator cracking at medium and high severity levels, only thin overlays reduced the alligator cracking area at medium severity level, whereas other three PM treatments had no significant effect on these crack types neither at medium nor at high severity level.

As shown in Table 3, the effectiveness of the PM treatments on the overall conditions of the pavement sections was assessed using WP total cracking length, roughness, and rutting. The results show that thin overlays, chip seals, and slurry seals had advantages in reducing the WP total cracking length. However, the mean and SD values of the roughness under crack sealing were only slightly reduced. The thin overlays and chip seals significantly reduced the rutting depths.

## 5.1.2  Individual Analysis of Short‑Term Performance Changes

The short-term performance change of each selected LTPP pavement section is presented using a histogram, where each bin represents an LTPP pavement section, and four PM

Table 2   Potentially influential factors in logistic model

| Variable type | Variable | Unit | Description |
| --- | --- | --- | --- |
| Categorical | Material | Fine/coarse | “MATL_CODE_EXP" in LTPP, subgrade material type (fine and coarse) |
| Numerical | Precipitation mm |  | “PRECIPITATION" in LTPP, the water equivalent of total surface precipitation over the month when the PM treatment conducted |
|  | Temperature °C |  | “TEMP_AVG” in LTPP, average of the daily air temperatures 2 m above the MERRA centroid in the PM treatment conducted month, based on average hourly temperatures |
|  | Cloud cover | % | “CLOUD_COVER_AVG" in LTPP, average daily fraction of cloud cover at MERRA cell centroid for the month when the PM treatment conducted |
|  | AADTT | Vehicle | “AADTT_VEH_CLASS_4-13_TREND" in LTPP, AADTT estimate for class 4 to 13 vehicles (trucks) in LTPP lane [31] |
|  | Thickness | cm | “REPR_THICKNESS" in LTPP, representative thickness for the AC layer in a section |

Table3Short-term pavement performance before and after PM treatments

<table><tr><td>Performance indicator</td><td>Severity level</td><td colspan="3">Thin overlay</td><td colspan="3">Chip seal</td><td colspan="3">Slurry seal</td><td colspan="3"></td><td colspan="3">Crack seal</td></tr><tr><td></td><td></td><td colspan="2">Mean</td><td colspan="2">SD</td><td colspan="2">Mean</td><td colspan="2"></td><td colspan="2">Mean</td><td colspan="2"></td><td colspan="2">Mean</td><td colspan="2"></td></tr><tr><td></td><td></td><td>B</td><td>A**</td><td>B</td><td>A</td><td>B</td><td>A</td><td>B</td><td>A</td><td>B</td><td>A</td><td>B</td><td>A</td><td>B</td><td>A</td><td>B</td><td>A</td></tr><tr><td>Longitudinal cracking (WP) /m</td><td>Low</td><td>17.27</td><td>5.76</td><td>31.17</td><td>14.26</td><td>27.99</td><td>6.90</td><td>51.14</td><td>18.71</td><td>19.33</td><td>7.75</td><td>25.35</td><td>16.34</td><td>12.05</td><td>16.83</td><td>21.50</td><td>33.94</td></tr><tr><td></td><td>Medium</td><td>0.10</td><td>1.02</td><td>0.48</td><td>4.81</td><td>1.48</td><td>1.03</td><td>5.24</td><td>4.88</td><td>0</td><td>1.28</td><td>0</td><td>5.85</td><td>1.61</td><td>1.12</td><td>5.73</td><td>7.11</td></tr><tr><td></td><td>High</td><td>0</td><td>0.05</td><td>0</td><td>0.51</td><td>0.30</td><td>0.29</td><td>1.42</td><td>2.07</td><td>0</td><td>0.20</td><td>0</td><td>2.75</td><td>0.73</td><td>0.98</td><td>5.24</td><td>5.13</td></tr><tr><td>Longitudinal cracking (NWP) /m</td><td>Low</td><td>41.66</td><td>24.59</td><td>60.78</td><td>54.29</td><td>31.48</td><td>16.21</td><td>57.04</td><td>37.06</td><td>53.66</td><td>25.14</td><td>58.49</td><td>52.59</td><td>32.54</td><td>56.57</td><td>55.36</td><td>84.05</td></tr><tr><td></td><td>Medium</td><td>0.52</td><td>17.72</td><td>2.55</td><td>47.97</td><td>35.34</td><td>17.61</td><td>72.25</td><td>44.38</td><td>13.12</td><td>18.71</td><td>33.36</td><td>45.27</td><td>9.54</td><td>23.60</td><td>25.73</td><td>53.42</td></tr><tr><td></td><td>High</td><td>0</td><td>4.94</td><td>0</td><td>26.15</td><td>0</td><td>8.09</td><td>0</td><td>30.78</td><td>0.95</td><td>6.94</td><td>3.2</td><td>33.91</td><td>6.64</td><td>8.38</td><td>24.94</td><td>35.11</td></tr><tr><td>Transverse cracking</td><td>Low</td><td>17.49</td><td>14.22</td><td>41.28</td><td>25.72</td><td>22.95</td><td>15.77</td><td>32.54</td><td>26.74</td><td>16.06</td><td>17.32</td><td>19.69</td><td>30.88</td><td>36.56</td><td>36.15</td><td>47.57</td><td>44.62</td></tr><tr><td></td><td>Medium</td><td>0.46</td><td>8.82</td><td>1.57</td><td>17.92</td><td>2.59</td><td>7.55</td><td>4.47</td><td>15.75</td><td>2.15</td><td>8.48</td><td>7.36</td><td>18.35</td><td>10.50</td><td>7.30</td><td>18.20</td><td>15.70</td></tr><tr><td></td><td>High</td><td>0</td><td>1.62</td><td>0</td><td>6.97</td><td>0</td><td>3.50</td><td>0</td><td>11.18</td><td>0</td><td>2.44</td><td>0</td><td>10.63</td><td>6.17</td><td>5.48</td><td>16.42</td><td>17.46</td></tr><tr><td>Transverse cracking</td><td>Low</td><td>10.29</td><td>9.53</td><td>17.22</td><td>19.86</td><td>11.90</td><td>11.79</td><td>17.12</td><td>22.34</td><td>12.30</td><td>17.1</td><td>17.23</td><td>35.59</td><td>22.49</td><td>28.46</td><td>27.84</td><td>40.87</td></tr><tr><td>/count</td><td>Medium</td><td>0.33</td><td>3.11</td><td>1.27</td><td>6.28</td><td>1.22</td><td>3.17</td><td>2.50</td><td>6.43</td><td>0.61</td><td>4.09</td><td>2.02</td><td>9.86</td><td>4.66</td><td>3.39</td><td>7.74</td><td>7.41</td></tr><tr><td></td><td>High</td><td>0</td><td>0.57</td><td>0</td><td>2.81</td><td>0.04</td><td>1.41</td><td>0.21</td><td>5.07</td><td>0</td><td>0.97</td><td>0</td><td>4.87</td><td>2.42</td><td>2.48</td><td>6.50</td><td>9.08</td></tr><tr><td>Alligator cracking</td><td>Low</td><td>13.49</td><td>6.90</td><td>4.61</td><td>21.28</td><td>20.04</td><td>6.60</td><td>54.63</td><td>31.17</td><td>25.16</td><td>28.25</td><td>58.50</td><td>73.10</td><td>7.98</td><td>18.95</td><td>32.77</td><td>51.02</td></tr><tr><td></td><td>Medium</td><td>19.78</td><td>6.80</td><td>66.36</td><td>38.52</td><td>0</td><td>4.21</td><td>0</td><td>30.51</td><td>1.44</td><td>10.55</td><td>6.74</td><td>40.74</td><td>6.03</td><td>11.45</td><td>39.01</td><td>46.03</td></tr><tr><td></td><td>High</td><td>0.375</td><td>2.63</td><td>1.83</td><td>22.95</td><td>0</td><td>2.74</td><td>0</td><td>30.56</td><td>0</td><td>0.97</td><td>0</td><td>8.88</td><td>0.19</td><td>4.94</td><td>1.37</td><td>34.62</td></tr><tr><td>Total WP cracked length/m</td><td></td><td>61.53</td><td>29.04</td><td>97.28</td><td>60.73</td><td>62.66</td><td>24.75</td><td>93.85</td><td>56.50</td><td>62.22</td><td>61.75</td><td>97.82</td><td>94.01</td><td>32.15</td><td>67.81</td><td>58.81</td><td>90.69</td></tr><tr><td>Roughness /(m/km)</td><td></td><td>1.31</td><td>1.32</td><td>0.52</td><td>0.51</td><td>1.27</td><td>1.55</td><td>0.42</td><td>0.61</td><td>1.25</td><td>1.48</td><td>0.44</td><td>0.53</td><td>1.82</td><td>1.59</td><td>0.78</td><td>0.76</td></tr><tr><td>Rutting/mm</td><td></td><td>8</td><td>5.04</td><td>4.41</td><td>2.78</td><td>8.27</td><td>7.61</td><td>3.86</td><td>4.13</td><td>7.75</td><td>8.19</td><td>3.52</td><td>3.17</td><td>7.06</td><td>7.59</td><td>3.33</td><td>3.74</td></tr></table>

treatments are marked in four different colors. Each bin with non-positive value on and under the horizontal axis indicates an effective PM treatment; otherwise, it is a non-effective treatment. Figures 1, 2, 3, 4, 5, and 6 show histograms of the pavement performance indicators under the four PM treatments.

The histograms of longitudinal cracking at WP in Fig. 1a show that almost all sections with chip seals, slurry seals, and thin overlays are under the horizontal axis (negative values) at all three severity levels, which indicates that the three treatments significantly reduced the longitudinal cracking. Among the bins under the horizontal axis, the chip seal treatments have the highest negative values representing the best short-term performance improvements. Crack sealing treatments have the most numbers of bins above the horizontal axis in the histograms for longitudinal cracking at all three severity levels. Similarly, in Fig. 1b, the histograms of longitudinal cracking at NWP, many bins with crack sealing

Fig. 1   a Effects of PM treatments on longitudinal cracking (WP). b Effects of PM treatments on longitudinal cracking (NWP)

![](images/page_7_chart_6.jpg)

(b)

![](images/page_7_chart_8.jpg)

Fig. 2   a Effects of PM treatments on transverse cracking (length). b Effects of PM treatments on transverse cracking (number of cracks)

![](images/page_8_chart_3.jpg)

![](images/page_8_chart_4.jpg)

are above the horizontal axis, whereas only a few bins are under the horizontal axis at low, medium, and high severity levels. This phenomenon reveals that the effectiveness of crack sealing is not significant in reducing longitudinal cracking at WP or NWP. In contrast, chip seal, slurry seal, and thin overlay have significant effects in repairing WP and NWP longitudinal cracking.

For the length of transverse cracking in Fig. 2a, the sections treated with chip seals, slurry seals, and thin overlays only have short-term performance changes at low and medium severity levels but not at high severity level. Crack sealing has short-term performance changes at all three severity levels. However, the sections with crack seals at the three severity levels have both positive and negative performance changes. For the number of transverse cracks in Fig. 2b, the phenomena are similar to those of transverse cracking length. Therefore, the effectiveness of chip seals, slurry seals, and thin overlays in reducing transverse cracking is generally better than that of crack seals.

The histograms for alligator cracking in Fig.  3 show that chip seals, slurry seals, and thin overlays can address alligator cracking very well at low severity level. In addition, slurry seals and thin overlays can even reduce medium severity alligator cracking. Nevertheless, the effects of crack seals on alligator cracking are not significant, especially at high severity level.

Fig. 3   Effects of PM treatments on alligator cracking

Fig. 4   Effects of PM treatments on total WP cracked length

![](images/page_9_chart_4.jpg)

The total WP cracked lengths indicate the effects of the PM treatments on reducing overall cracking distress. The result in Fig. 4 shows that thin overlays and chip seals are effective in reducing cracked lengths at WP, and slurry seals are also an effective treatment for most sections with large WP cracking. In contrast, WP cracked lengths are increased in almost 50% of the sections with crack seal treatments.

In terms of roughness analysis in Fig. 5, thin overlays have the most significant effects on MRI reduction with the greatest number of bins under the horizontal axis, while there are still few sections having MRIs increased after thin overlay treatments. A lot of bins with chip seal, slurry seal, and crack seal treatments are above the horizontal axis, indicating that some of these treatments may not make roughness improvement. Therefore, the short-term effectiveness of the PM treatments on roughness is not as significant as the effectiveness of the treatments on cracks.

Comparing with roughness, the histograms of rutting depth in Fig. 6 show that most of the road sections have negative short-term performance changes with bins underneath the horizontal axis. This phenomenon indicates that PM treatments are effective for rutting performance improvement. Moreover, thin overlays and chip seals have more significant effects than slurry seals and crack seals. However, there are still few sections having no decrease in rutting after PM treatments. Hence, the effectiveness of PM treatments in addressing rutting depths is not consistent among the PM treatments.

Fig. 5   Effects of PM treatments on roughness

Fig. 6   Effects of PM treatments on rutting depth

![](images/page_10_chart_4.jpg)

In summary, based on the above analysis, the four PM treatments have shown different effectiveness results in short-term performance improvement with different pavement performance indicators. Chip seals, slurry seals, and thin overlays have significant effects on addressing cracking distress; thin overlays have the best effects on roughness improvement; and chip seals and thin overlays reduce rutting more significantly than the other treatments.

## 5.2  Influential Factor Analysis

The short-term effectiveness analysis results indicate that chip seals, thin overlays, and slurry seals have significant effects on improving longitudinal cracking, transverse cracking, alligator cracking, and rutting. These PM treatments have the best effects in reducing the cracking at low severity level. However, the effectiveness of crack seals is not stable on these performance indicators. As for roughness, thin overlays are the only treatment type that shows a significant effect on roughness improvement. The results of the short-term performance characteristics of the PM treatments in this study are consistent with the previous experience presented in “2.2 Preventive maintenance”.

To investigate what factors impact the effectiveness of the PM treatments, potentially influential factors were adopted to analyze their effects on the short-term effectiveness of PM treatments in terms of typical performance indicators (i.e., WP longitudinal cracking, transverse cracking length, and alligator cracking at low severity level, MRI, and maximum average rutting depth). The factors incorporated included precipitation, temperature, and cloud cover from climate at the time of construction, AADTT from traffic, and subgrade material and asphalt concrete (AC) layer thickness from the structure. The mixed-effects logistic regression analysis results are shown in Table 4.

The modeling results of the logistic regression coefficients show that precipitation and temperature at the time of construction, AADTT, and AC layer thickness have significant impacts on the effectiveness of chip seals on roughness and rutting. The cloud cover at the time of construction also impacts a chip seal for rutting treatment. As for crack seal, temperature and subgrade material significantly influence the crack seal effectiveness on all the five performance indicators. Meanwhile, precipitation impacts a crack seal in addressing longitudinal cracking, transverse cracking, alligator cracking, and roughness. Cloud cover and AC layer thickness have influences on roughness and rutting. The factor analysis of slurry seal effectiveness reveals that precipitation, cloud cover, and subgrade material have impacts on roughness and rutting; temperature and AC layer thickness have impacts on transverse cracking, roughness, and rutting; and AADTT has an impact on longitudinal cracking, transverse cracking, and roughness. In thin overlays, cloud cover and AADTT are related to the treatment effect on roughness and rutting, and precipitation and subgrade material are related to roughness performance. In Table 4, some performance indicators, especially in chip seals and thin overlays, have no significant influential factors and the estimated odds are “1.000”. Because these pavements have majority/all of the short-term performance results under a specific PM treatment being labeled as “1” in the logistic regression model, and there is no enough classification for “0”.

Among the significant factors, temperature, cloud cover, and subgrade material are more important factors to the PM treatments revealed by high odds estimate values. The estimates in Table 4 are the odds value instead of log odds (by taking exponent of the estimated coefficient), which is the ratio of the probability of a PM treatment to be “effective” to the probability to be “non-effective.” For example, 1198.7 in Table 4 shows that one unit (°C) air temperature increase (the temperature should be in an appropriate range) may increase the odds of chip seal effectiveness on rutting by 1198.7 times.

Table 4   Logistic regression analysis results of PM treatments

| Performance | PM treatments | Precipitation | Temperature | Cloud cover | Material | AADTT | Thickness |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Chip seal | Longitudinal cracking (WP) | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 |
|  | Transverse cracking | 1.742 | 2.064 | 3.814 × e^22 | 1.831 × e^-21 | 1.110 | 1.112 × e^7 |
|  | Alligator cracking | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 |
|  | Roughness | 0.988* | 0.912* | 0.477 | 0.803 | 0.999* | 0.921* |
|  | Rutting | 0.395* | 1198.7* | 0.021* | 0.099 | 0.619* | 0.395* |
| Crack seal | Longitudinal cracking (WP) | 0.992* | 0.892* | 2.401 | 3.306* | 0.992* | 0.554* |
|  | Transverse cracking | 0.995* | 1.040* | 3.826 | 2.678* | 0.999 | 0.646* |
|  | Alligator cracking | 1.020* | 1.149* | 0.651 | 0.132* | 1.001 | 0.451* |
|  | Roughness | 1.007* | 0.887* | 0.002* | 1.777* | 1.000 | 0.826* |
|  | Rutting | 1.003 | 1.078* | 15.847* | 0.264* | 0.999 | 0.989 |
| Slurry seal | Longitudinal cracking (WP) | 1.133 | 0.019 | 1.718 × e^4 | 6.668 × e^12 | 0.994* | 6.168 × e^-11 |
|  | Transverse cracking | 1.005 | 0.801* | 0.140 | 1.165 | 1.000* | 0.624* |
|  | Alligator cracking | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 |
|  | Roughness | 0.992* | 0.833* | 57.949* | 0.434* | 1.001* | 0.830* |
|  | Rutting | 0.974* | 0.918* | $\mathbf { 2 . 6 0 1 \times e ^ { \wedge } 6 ^ { * } }$ | 3.163* | 0.999 | 1.331* |
| Thin overlay | Longitudinal cracking (WP) | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 |
|  | Transverse cracking | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 |
|  | Alligator cracking | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 |
|  | Roughness | 0.994* | 0.989 | 48.443* | 2.312* | 0.999* | 0.966 |
|  | Rutting | 0.995 | 1.053 | 4.627 × e^9* | 0.918 | 0.996* | 0.902 |

\* Represents the factor is statistically significant with a p-value less than 0.05; a factor with both asterisk and bold means the factor is important to the PM treatments with a p-value less than 0.05 and a high odds estimate value

To quantitatively compare the effectiveness of the four PM treatments on short-term performance, the Odds Ratio was applied by taking a ratio of two odds. The Odds Ratio results of the treatments on each performance indicator are presented in Table 5. For WP longitudinal cracking, chip seal treatment is the most effective, followed by thin overlay, slurry seal, and crack seal. Thin overlay is the best treatment for NWP cracking distresses, and followed by chip seal, slurry seal, and crack seal. As for roughness and rutting, thin overlay is the best treatment, which is followed by chip seal, crack seal, and slurry seal. Overall, thin overlay is the most effective treatment on short-term pavement performance, and chip seal is the second effective treatment. The typical cost of thin overlay is \$2.09–\$2.39 per m<sup>2</sup> with an expected life of 7–10 years, whereas the typical cost of chip seal is only \$0.90–\$1.08 per m<sup>2</sup> with an expected life of 4–7 years. By comparing the effectiveness of the four PM treatments on short-term performance, as well as typical construction costs and expected service lives, the chip seal treatment has the highest cost-effectiveness on pavement performance improvement.

## 6  Summary and Conclusions

This study evaluated the short-term effectiveness of chip seal, crack seal, slurry seal, and thin overlay treatments, and analyzed their influential factors. The data were retrieved from the SPS-3 of the LTPP program. Longitudinal cracking, transverse cracking, alligator cracking, the total length of cracks at WP, roughness, and rutting were employed as the indicators of pavement performance to evaluate the four typical PM treatments. Precipitation, temperature, cloud cover, subgrade material type, AC layer thickness, and AADTT were analyzed as influential factors using a mixed-effects logistic regression model. The results show that the four PM treatments have different effects on various pavement performance indicators. The influencing factor analysis of short-term performance improvement suggests that temperature, cloud cover, and subgrade material are significant influencing factors for the PM treatments.

The conclusions of this study are as follows:

1. Chip seal, slurry seal, and thin overlay have significant effects in improving the short-term performance of longitudinal cracking, transverse cracking, and alliga tor cracking at low severity level, while the effects at medium and high severity levels are not significant.

2. The effectiveness of crack seal on the short-term performance of the three cracking distress types is not significant, and the short-term effectiveness of the PM treatments on roughness and rutting is not as significant as that on cracking.

3. Thin overlay has the most significant effect in reducing roughness in short term, and thin overlay and chip seal have more significant effects on short-term rutting performance.

4. Temperature and cloud cover at the time of construction and subgrade material are important factors for the PM treatments.

5. Chip seal treatment is believed to have the best costeffectiveness on pavement performance improvement.

However, there are still limitations in this study. The longterm pavement performance changes are crucial for pavement performance assessment and maintenance decisionmaking. This study only focuses on short-term performance changes and associated influencing factors but not including long-term pavement performance changes and the associated influencing factors. In addition, the pavement performance indicators and potentially influential factors for the PM treatments were also limited in this study due to data availability. Some important influential factors that should be considered in the performance analysis may also include initial material properties. The effect of PM on long-term cracking and ravelling performance is highly affected by the initial material properties (quality and durability of binders used). A previous study of seal coat treatments by the authors based on the LTPP data has proved that the initial pavement condition and asphalt grade significantly impacted the effectiveness of seal coats in terms of cracking, rutting, and IRI [38]. However, the initial pavement condition data and material property data in the LTPP SPS-3 were unavailable for all of the four types of PM treatments in our study. Future research efforts should seek relevant data to address these issues by conducting analysis of long-term performance changes and involving potentially influential factors of initial material properties for PM treatments.

Table 5   Odds ratios of the PM treatments on performance indicators

| Performance indicator | Crack seal vs. chip seal | Slurry seal vs. chip seal | Thin overlay vs. chip seal |
| --- | --- | --- | --- |
| Longitudinal cracking (WP) | 4.286 × e^-9 | 1.267 × e^-7 | 0.517 |
| Longitudinal cracking (NWP) | 5.053 × e^-9 | 2.736 × e^-8 | 1.787 |
| Transverse cracking | 0.061 | 0.539 | 8.570 × e^6 |
| Alligator cracking | 4.679 × e^-9 | 0.723 | 2.175 |
| Roughness | 1.265 | 0.980 | 4.356 |
| Rutting | 0.645 | 0.260 | 2.841 |

**Acknowledgements** The authors are grateful to Texas State University for supporting this study.

**Author Contributions** The authors confirm contribution to the paper as follows: study conception and design: XL and FW; data collection: HG and JT; analysis and interpretation of results: NW, XQ, and XL; draft manuscript preparation: FW and XL. All authors reviewed the results and approved of the final version of the manuscript.

**Funding** Faculty start-up fund by Texas State University.

## Declarations

**Conflict of Interest** The authors declare that there is no conflict of interest.

## References

1. Pavement Preservation, FHWA, U.S. Department of Transportation. [https://www.fhwa.dot.gov/pavement/preservation/091205.cfm](https://www.fhwa.dot.gov/pavement/preservation/091205.cfm). Accessed 1 July 2020.

2. Jia, Y., Dai, X., Wang, S., Gao, Y., Wang, J., & Zhou, W. (2020). Evaluation of long-term effectiveness of preventive maintenance treatments using LTPP SPS-3 experiment data. Construction and Building Materials, 247, 118585. [https://doi.org/10.1016/j.conbuildmat.2020.118585](https://doi.org/10.1016/j.conbuildmat.2020.118585).

3. Peshkin, D. G., Hoerner, T. E., Zimmerman, K. A. (2004). Optimal timing of pavement preventive maintenance treatment applications. Publication NCHRP Report 523. National Cooperative Highway Research Program, Transportation Research Board, Washington, DC.

4. Jackson, D. J. (2001) Pavement preventive maintenance guidelines. Publication No. 01–128. In: Second international symposium on maintenance and rehabilitation of pavements and technological control, Auburn, Alabama.

5. Hick, R. G., Seeds, S. B., & Peshkin, D. G. (2000). Selecting a preventive maintenance treatment for flexible pavements. Publication FHWA-IF-00–027. Office of Asset Management, FHWA, U.S. Department of Transportation.

6. Dong, Q., Chen, X., Huang, B., & Gu, X. (2018). Analysis of the influence of materials and construction practices on slurry seal performance using LTPP data. Journal of Transportation Engineering Part B Pavements, 144(4), 04018046. [https://doi.org/10.1061/JPEODX.0000069](https://doi.org/10.1061/JPEODX.0000069).

7. Gransberg, D. D. (2006). Correlating chip seal performance and construction methods. Transportation Research Record, 1958(1), 54–58. [https://doi.org/10.1177/0361198106195800106](https://doi.org/10.1177/0361198106195800106).

8. Shuler, S., Lord, A., Epps Martin, A., & Hoyt D. (2011). Manual for emulsion-based chip seals for pavement preservation. NCHRP Report 680. National Cooperative Highway Research Program, Transportation Research Board, Washington, DC.

9. Chen, X., Zhu, H., Dong, Q., & Huang, B. (2017). Optimal thresholds for pavement preventive maintenance treatment using LTPP data. Journal of Transportation Engineering Part A Systems, 143(6), 04017018. [https://doi.org/10.1061/JTEPBS.0000044](https://doi.org/10.1061/JTEPBS.0000044).

10. Amarasiri, S., & Muhunthan, B. (2020). Evaluating the effectiveness of pavement preventive-maintenance treatments in mitigating longitudinal cracks in wet-freeze climatic zones. Journal of Transportation Engineering Part B Pavements, 146(2), 04020014.

11. Dong, Q., & Huang, B. (2015). Failure probability of resurfaced preventive maintenance treatments. Transportation Research Record, 2481(1), 65–74. [https://doi.org/10.3141/2481-09](https://doi.org/10.3141/2481-09).

12. Jia, Y., Wang, J., Gao, Y., Yang, M., & Zhou, W. (2020). Assessment of short-term improvement effectiveness of preventive maintenance treatments on pavement performance using LTPP data. Journal of Transportation Engineering Part B Pavements, 146(3), 04020048.

13. Morian, D. A., Epps, J. A., & Gibson, S. D. (1997). Pavement treatment effectiveness, 1995 SPS-3 and SPS-4 site evaluations, National Report. Publication FHWA-RD-96–208. Office of Engineering Research and Development, FHWA, U.S. Department of Transportation.

14. Gong, H., Dong, Q., Huang, B., & Jia, X. (2016). Effectiveness analyses of flexible pavement preventive maintenance treatments with LTPP SPS-3 experiment data. Journal of Transportation Engineering, 142(2), 04015045. [https://doi.org/10.1061/(ASCE)TE.1943-5436.0000818](https://doi.org/10.1061/%28ASCE%29TE.1943-5436.0000818).

15. Chen, X., Dong, Q., Zhu, H., & Huang, B. (2016). Development of distress condition index of asphalt pavements using LTPP data through structural equation modeling. Transportation Research Part C Emerging Technologies, 68, 58–69. [https://doi.org/10.1016/j.trc.2016.03.011](https://doi.org/10.1016/j.trc.2016.03.011).

16. Wang, H., & Wang, Z. (2013). Evaluation of pavement surface friction subject to various pavement preservation treatments. Construction and Building Materials, 48, 194–202. [https://doi.org/10.1016/j.conbuildmat.2013.06.048](https://doi.org/10.1016/j.conbuildmat.2013.06.048).

17. Loizos, A., & Karlaftis, M. G. (2005). Prediction of pavement crack initiation from in-service pavements. Transportation Research Record, 1940(1), 38–42. [https://doi.org/10.1177/0361198105194000105](https://doi.org/10.1177/0361198105194000105).

18. Labi, S., & Sinha, K. C. (2003). Measures of short-term effectiveness of highway pavement maintenance. Journal of Transportation Engineering, 129(6), 673–683. [https://doi.org/10.1061/(ASCE)0733-947X(2003)129:6(673)](https://doi.org/10.1061/%28ASCE%290733-947X%282003%29129:6%28673%29).

19. Hall, K. T., Correa, C. E., & Simpson, A. L. (2003). Performance of flexible pavement maintenance treatments in the longterm pavement performance SPS-3 experiment. Transportation Research Record, 1823(1), 47–54. [https://doi.org/10.3141/1823-06](https://doi.org/10.3141/1823-06).

20. Mamlouk, M. S., & Dosa, M. (2014). Verification of effectiveness of chip seal as a pavement preventive maintenance treatment using LTPP data. International Journal of Pavement Engineering, 15(10), 879–888. [https://doi.org/10.1080/10298436.2014.893318](https://doi.org/10.1080/10298436.2014.893318).

21. Dong, Q., Huang, B., Richards, S. H., & Yan, X. (2013). Costeffectiveness analyses of maintenance treatments for low-and moderate-traffic asphalt pavements in tennessee. Journal of Transportation Engineering, 139(8), 797–803. [https://doi.org/10.1061/(ASCE)TE.1943-5436.0000556](https://doi.org/10.1061/%28ASCE%29TE.1943-5436.0000556).

22. Labi, S., Lamptey, G., Konduri, S., & Sinha, K. C. (2005). Analysis of long-term effectiveness of thin hot-mix asphaltic concrete overlay treatments. Transportation Research Record, 1940(1), 2–12. [https://doi.org/10.1177/0361198105194000101](https://doi.org/10.1177/0361198105194000101).

23. Mamlouk, M. S., & Zaniewski, J. P. (1998) Pavement preventive maintenance: Description, effectiveness, and treatments. In: Flexible pavement rehabilitation and maintenance. ASTM International.

24. Luo, X., Wang, F., Wang, N., Qiu, X., Amini, F., & Tao, J. (2020). Factor analysis of maintenance decisions for warranty pavement projects using mixed-effects logistic regression. International Journal of Pavement Engineering. [https://doi.org/10.1080/10298436.2020.1766039](https://doi.org/10.1080/10298436.2020.1766039).

25. Khraibani, H., Lorino, T., Lepert, P., & Marion, J. M. (2012). Nonlinear mixed-effects model for the evaluation and prediction of pavement deterioration. Journal of Transportation Engineering, 138(2), 149–156. [https://doi.org/10.1061/(ASCE)TE.1943-5436.0000257](https://doi.org/10.1061/%28ASCE%29TE.1943-5436.0000257).

26. Lamptey, G., Labi, S., & Li, Z. (2008). Decision support for optimal scheduling of highway pavement preventive maintenance within resurfacing cycle. Decision Support Systems, 46(1), 376–387. [https://doi.org/10.1016/j.dss.2008.07.004](https://doi.org/10.1016/j.dss.2008.07.004).

27. Elkins, G. E., Schmalzer, P., Thompson, T., & Simpson, A. (2003). Introduction to the LTPP information management system (IMS). Publication FHWA-RD-03–088. FHWA, U.S. Department of Transportation.

28. Schmalzer, P. N., Plett, R. W., & Elkins, G. E. (2010). LTPP Specific Pavement Studies (SPS) Materials action plan final report. Publication FHWA-HRT-10–049. Office of Infrastructure Research and Development, FHWA, U.S. Department of Transportation.

29. Khattak, M. J., & Alrashidi, M. (2013). Performance of preventive maintenance treatments of flexible pavements. International Journal of Pavement Engineering, 6(3), 184.

30. TxDOT Glossary, Texas Department of Transportation (TxDOT), 2013.

31. Hicks, R. G., Dunn, K., & Moulthrop, J. S. (1997). Framework for selecting effective preventive maintenance treatments for flexible pavements. Transportation Research Record, 1597(1), 1–10.

32. Chang, J. R., Chen, D. H., & Hung, C. T. (2005). Selecting pre-ventive maintenance treatments in Texas: Using the technique for order preference by similarity to the ideal solution for specific pavement study–3 sites. Transportation Research Record, 1933(1), 62–71.

33. Maintenance Operation Manual, Maintenance Division, Texas Department of Transportation (TxDOT), 2018.

34. Yamada A. (1999). Asphalt seal coat treatments. Publication No. 9977 1201-SDTDC. Department of Agriculture.

35. Attoh-Okine, N., & Park, H. (2007). Thin overlay maintenance treatment application in delaware communities. Delaware Department of Transportation.

36. Vargas-Nordcbeck, A., Vrtis, M. C., & Worel, B. (2019). Performance of chip seal treatments in two different climatic regions. Transportation Research Record, 2673(12), 728–736. [https://doi.org/10.1177/0361198119853546](https://doi.org/10.1177/0361198119853546).

37. Hosmer, D. W., Jr., Lemeshow, S., & Sturdivant, R. X. (2013). Applied logistic regression. New York: John Wiley & Sons Inc.

38. Luo, X., Wang, F., Bhandari, S., Wang, N., & Qiu, X. (2013). Effectiveness evaluation and influencing factor analysis of pavement seal coat treatments using random forests. Construction and Building Materials, 282, 122688. [https://doi.org/10.1016/j.conbuildmat.2021.122688](https://doi.org/10.1016/j.conbuildmat.2021.122688).

![](images/page_14_image_18.jpg)

**Xiaohua Luo** is a Postdoctoral Research Associate in Ingram School of Engineering at Texas State University, San Marcos. She obtained her Ph.D. in Civil Engineering from Jackson State University, Jackson, Mississippi, in 2019. Her expertise is in pavement management systems, pavement warranty program, and cost-effectiveness analysis of pavement maintenance strategies. Her recent researches include: 1) quality assurance/ quality control (QC/QA) of automated pavement distress data

collection, 2) cost-effectiveness analysis of pavement warranty projects, 3) seal coat treatment evaluation, 4) 3D image processing for distress detection of pavement and infrastructure, and 5) threshold update of alternative delivery projects in design-build contracts.

![](images/page_14_image_21.jpg)

**Feng Wang** is an Associate Professor in Civil Engineering of the Ingram School of Engineering at Texas State University. He received his Ph.D. in Transportation Engineering from the University of Texas at Austin and has conducted research, teaching, and service in Transportation Engineering for more than 20 years. Feng has been awarded several major projects at state and federal levels to conduct research in Pavement Management Systems using questionnaire surveys, statistical analysis,

optimization modeling, and decision modeling to investigate highway pavement management problems and data collection methods, especially image based technologies. He is a registered professional engineer (PE) of Mississippi. He is the current member of the Pavement Management Systems committee of the Transportation Research Board (TRB) of the National Academies.

![](images/page_14_image_24.jpg)

engineering.

**Haitao Gong** is currently a doctoral student in Materials Science, Engineering, and Commercialization (MSEC) program at Texas State University. He received his B.S. double degrees in Transportation Engineering and Computer Science from Huazhong University of Science and Technology in Wuhan in 2009, and M.S. degree of Transportation Planning and Management from Tongji University in Shanghai in 2012. His research interest is machine learningbased application in civil

![](images/page_15_image_2.jpg)

**Jueqiang Tao** is a Doctoral Assistant in Materials Science, Engineering, and Commercialization (MSEC) Program at Texas State University, San Marcos. He obtained his M.S. in Civil Engineering from China in 2019. His expertise is in pavement management systems, computer vision, three-dimension (3D) reconstruction, and artificial intelligent (AI) techniques. His recent research include: 1) automated petrographic analysis of the airvoid system in hardened concrete using 3D techniques, 2) AI-

![](images/page_15_image_4.jpg)

Ningning Wang is an associate professor in the department of mathematics and statistical sciences at Jackson State University. She obtained her Ph.D. in statistics from Oklahoma State University, Stillwater, Oklahoma, in 2013. Her research interests include nonparametric statistics, applied statistics on engineering and public health.

based automated failure detection and quantification of transportation infrastructures, 3) quality assurance/quality control (QC/QA) of automated pavement distress data collection, 4) warranty pavement performance evaluation and maintenance decision making.

![](images/page_15_image_7.jpg)

**Xin Qiu** is the deputy dean of the College of Engineering at Zhejiang Normal University. He got his Ph.D. from Tongji University of China and worked as a post-doctor at Institute for Multi-modal Transportation (IMTrans), Jackson State University. His research fields include pavement performance, dynamic diagnosis, road infrastructure construction and maintenance techniques, and mechanical behavior of road m a t e r i a l s a n d p ave m e n t structure.