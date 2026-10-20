<!--
SOURCE: 原始 PDF: City_Contest/ref/132 Multi-Criteria Decision-Making Framework (AHP-TOPSIS) Pavement Preventive Mainte.pdf | 页数: 20 | 集合: city_contest_ref
题录: litfull-064 132 Multi-Criteria Decision-Making Framework (AHP-TOPSIS) Pavement Preventive Mainte (DOI: 10.3390/buildings14103048)
提取: MinerU markdown 全文（可重建索引的真相源副本；images/ 不入 corpus）
-->
Article

# Multi-Criteria Decision-Making Framework (AHP-TOPSIS): Pavement Preventive Maintenance Case Study for Ordinary National Trunk Highways

**Yaohan Liu** <strong><sup>1,2</sup></strong>**, Chun Yu** <strong><sup>3</sup></strong>**, Feiyang Guo** <strong><sup>1,2</sup></strong>**, Xin Zhao** <strong><sup>4</sup></strong>**, Jinhuan Shan** <strong><sup>1,2</sup></strong>**,\*, Tong Lu** <strong><sup>1,2</sup></strong>**,\*, Hongxin Peng** <strong><sup>1,2</sup></strong> **and Dongdong Yuan** <strong><sup>1,2</sup></strong>**,\***

1 School of Highway, Chang’an University, South 2nd Ring Road Middle Section, Xi’an 710064, China; yaohanliu@chd.edu.cn

2 Key Laboratory for Special Area Highway Engineering of Ministry of Education, Chang’an University, South 2nd Ring Road Middle Section, Xi’an 710064, China

3 Jiangxi Provincial Highway Engineering Inspection Center, Nanchang 330199, China; jxglgcjczxlj@163.com

4 Shaanxi Transportation Planning and Design Institute Co., Ltd., Xi’an 710075, China

\* Correspondence: jhshan@chd.edu.cn (J.S.); tlu@chd.edu.cn (T.L.); ddy@chd.edu.cn (D.Y.)

**Citation:** Liu, Y.; Yu, C.; Guo, F.; Zhao, X.; Shan, J.; Lu, T.; Peng, H.; Yuan, D. Multi-Criteria Decision-Making Framework (AHP-TOPSIS): Pavement Preventive Maintenance Case Study for Ordinary National Trunk Highways. Buildings **2024**, 14, 3048. https://doi.org/10.3390/buildings14103048

Academic Editor: Pramen P. Shrestha

Received: 20 August 2024 Revised: 18 September 2024 Accepted: 20 September 2024 Published: 24 September 2024

![](images/page_0_image_13.jpg)

**Copyright:** © 2024 by the authors. Submitted for possible open access publication under the terms and conditions of the Creative Commons Attribution (CC BY) license (https://creativecommons.org/licenses/by/4.0/)..

**Abstract:** Pavement maintenance and rehabilitation decision-making needs to weigh multiple stra tegic goals to achieve sustainable development through the pavement maintenance management system. Making decisions regarding pavement preventive maintenance is both intricate and costly. This study introduces a multi-criteria decision-making framework aimed at enhancing the scientific basis of such decisions. The framework first establishes an evaluation system for preventive mainte nance strategies by considering three primary evaluation criteria—service functionality, pavement performance, and economic benefits, and then identifies nine specific evaluation indicators to influence these criteria, with a comparison matrix constructed to determine the weight of each indicator in relation to the maintenance decision hierarchy. Following this, the technique for order preference by similarity to ideal solution (TOPSIS) is employed to prioritize four commonly utilized preventive maintenance strategies. The results reveal that pavement condition and maintenance costs are the most influential factors in determining the appropriate preventive maintenance strategies for national highways. The priority rankings for the four strategies—slurry seal, micro-surfacing, chip seal, and ultra-thin overlays—are found to be 56.12%, 63.86%, 12.12%, and 83.52%, respectively, with ultra-thin overlays identified as the optimal choice for second-class highways. The decision making model utilized in this study enables a multi-dimensional analysis, reducing the subjectivity inherent in expert evaluations and facilitating the prompt identification of the most suitable mainte nance strategy.

**Keywords:** preventive maintenance strategy; maintenance scheme; analytic hierarchy process (AHP); technique for order preference by similarity to ideal solution (TOPSIS); destruction of the highway; highway service life

## 1. Introduction

The determination of reasonable maintenance timing and scheme for pavement plays a crucial role in the normal performance of the service level during the design life of road. According to relevant data from China’s Ministry of Transport, by the end of 2023, the total mileage of roads in China had reached 5,441,000 km, of which maintenance mileage accounted for more than 99 percent [1]. China, as the country with the longest total mileage of traffic, possesses units in the structural design of highways that are expected to have a service life of more than 15 years, but due to overloading, environmental impacts, and improper maintenance measures, most of the road sections will require overhauling within only 5–10 years of use [2,3]. The performance of pavement presents certain regular changes with the change in service life, as shown in Figure 1. If no intervention is made when functional damage occurs on the pavement, the bearing capacity of the pavement rapidly decreases under the repeated action of environment and traffic load, and the functional damage develops into structural damage, which results in the need for heavy and intermediate maintenance of pavement before reaching the specified service life, which not only seriously shortens the service life but also results in the wastage of maintenance funds [4–6].

Preventive maintenance refers to the structurally intact pavement or appurtenant facilities under the premise of not increasing the structural bearing capacity of the pavement, the structurally intact pavement or appurtenant facilities are planned to take some kind of cost-effective measures in order to achieve the purpose of maintaining the pavement system, delaying the damage, and maintaining and improving the functional condition of the pavement, etc. [7–10]. As one of the important components of PMMS, preventive maintenance plays an important role in the maintenance decision-making for asphalt pavements [11].

![](images/page_1_chart_4.jpg)

Figure 1. Relationship between road service levels, maintenance, and years of operation.

The current preventive maintenance measures applicable to highways include fog seal, chip seal, fiber chip sealer, micro-surfacing, composite seal, and ultra-thin overlays [12]. According to the recommendation of the “Technical Specifications for Preventive Maintenance of Highway Asphalt Pavement” (JTG/T 5142-01—2021) [13], all the above preventive maintenance techniques are applicable to national trunk highways. In practice, when a variety of conservation techniques are applied simultaneously and the lack of experience does not allow for an informed evaluation of the relative merits of each, it is necessary to select the conservation scheme that best aligns with the desired outcome. At pre sent, the primary determinant of decision-making on maintenance schemes is the technical condition of the pavement, with minimal consideration given to the combined impact of the various schemes on a multitude of factors, including anticipated outcomes and economic considerations. Decision-making on road maintenance usually involves a number of subjective and objective factors, such as maintenance technology, pavement performance, budgetary constraints, the choice of materials and equipment, and other considerations. Simultaneously, the selection of a maintenance scheme is an intricate decisionmaking process. The implementation of an irrational preventive maintenance scheme not only fails to impede the deterioration of pavement performance, but also fails to maintain the level of road service. Furthermore, it results in the squandering of maintenance funds, thereby reducing the comprehensive benefits of maintenance. It is thus imperative that a reasonable method for evaluating maintenance schemes be adopted in the decision-making process.

Multi-criteria decision analysis (MCDM) has garnered considerable interest as a pivotal decision-theoretic methodology, with successful applications in diverse domains such as road operation and maintenance [14], environmental assessment [15,16], and project planning [17,18]. MCDM prioritizes a series of alternatives by considering multiple criteria through the use of decision data and related methods to ascertain the relative influence of each factor on the alternatives under consideration. Decision-making for scientific maintenance scheme of pavements is a multi-criteria decision analysis problem, which can be carried out by the best–worst method (BWM) [19], hierarchical analysis (AHP) [20], multi-criteria compromised solution ranking method (VKM) [21], and technique for order of preference by similarity to an ideal solution (TOPSIS) [22].

Among the numerous multi-criteria decision analysis techniques applied to pavement maintenance decisions, AHP has emerged as the most prevalent approach [23–26]. AHP was proposed by Saaty as a systematic and comprehensive evaluation method based on experience and knowledge [20]. It is designed to assess the importance of factors involved in a pairwise manner, with the objective of clarifying the relative importance among the factors. Ramadhan R.H. [27] applied AHP to ascertain the relative importance of various factors influencing pavement maintenance, including road type, pavement condition, traffic volume, road travelling quality, safety, maintenance cost, and overall importance of the road to the community. Ahmed S. [28] put forth an optimized AHP method for the prioritization of maintenance road sections. This method assigns pairwise comparison values based on field data collected from a road network consisting of 28 road sections in the city of Mumbai. The final ranked list of candidate road sections takes into account the priority weights of the alternatives, reflecting the pavement conditions.

From the existing studies, it can be found that the hierarchical analysis method generally requires the use of expert ratings as the basis for judgment, which inherently involves a degree of subjectivity. The objective of the present research is to enhance the scientific rigor and accuracy of these empirical data in order to facilitate more informed decision-making regarding the prioritization of options. The technique for order of preference by similarity to an ideal solution (TOPSIS) [29] is based on distance in order to measure the degree of importance of each factor of the decision-making objective. This approach has the potential to weaken the influence of the human factor in the AHP, and therefore, it has been highly valued, applied, and adopted in various decision-making contexts. Chang J.R. [30] employed MCDM to ascertain the cost-effectiveness of 14 pavement-specific maintenance schemes (thin overlays, slurry seal, crack seal, and chip seal) in Texas. This was achieved by utilizing the Defective Score (DS), the International Roughness Index (IRI), and treatment costs through a sequential prioritization technique that bears resemblance to the ideal solution. The cost-effectiveness of these treatments can be quantified through TOPSIS, thereby reducing the impact of subjective judgments on the results. In a comparative study of the fuzzy AHP and fuzzy TOPSIS techniques for pavement maintenance prioritization, Ouma Y. [26] observed that the former method yielded higher maintenance priority rankings than the latter. Relatively few studies have been conducted using a combined AHP-TOPSIS approach for pavement preventive maintenance decision-making.

In order to achieve this objective, this study puts forward a novel approach to decision-making for the development of pavement preventive maintenance schemes. This approach draws upon a synthesis of two techniques, namely the AHP and TOPSIS. The remainder of this paper is structured as follows: Section 2 introduces the fundamental principles of the AHP and TOPSIS research methods. The AHP-TOPSIS method is employed to calculate the weights of the indicators, and a comprehensive evaluation model of the AHP-TOPSIS pavement preventive maintenance scheme is established. Section 3 establishes a decision-making evaluation system for pavement preventive maintenance schemes, with the typical road sections in Jiangxi Province, China, serving as an illustrative example. Section 4 evaluates the priority of four types of preventive maintenance schemes: thin slurry sealer, micro-surface treatment, gravel sealer, and ultra-thin overlay.

It then recommends the optimal scheme for the preventive maintenance of pavements on national trunk highways.

## 2. Methodology

This section defines the decision objectives, the main criteria influencing their achievement, and the breakdown of the indicators, thereby establishing the objective, criterion, and indicator layers of the model. This study evaluates the preventive maintenance schemes of national trunk highways by first determining the evaluation criteria and scoring principles. Hierarchical analysis is then used to determine the weights and scores of index elements, followed by prioritizing the schemes using the TOPSIS method [20,22]. The operational flow of the proposed AHP-TOPSIS method is illustrated in Figure 2.

![](images/page_3_image_5.jpg)

Figure 2. Operational flow of AHP-TOPSIS method.

## 2.1. Definition of Evaluation Indicators and Scoring Principles

An evaluation system for preventive maintenance schemes for national trunk highways has been established with reference to the industry’s standards and the accumulated experience of experts in the field (O). In order to ascertain the indicators of the criterion layer, it is essential to elucidate the factors that influence the selection of a pavement maintenance scheme. These factors are typically considered to encompass, but are not limited to, pavement condition, traffic load, environmental conditions, cost budget, road class and function, maintenance history, and so forth. Accordingly, the evaluation system of the preventive maintenance scheme for national trunk highways comprises three criterion layers. The first of these is the service function layer (C1), which encompasses three indicators: driving comfort (X1), appearance (X2), and noise (X3). The second is the pavement performance layer (C2), which includes three indicators: quality index (X4), pavement damage (X5), and skid resistance (X6). Finally, the economic effectiveness layer (C3) incorporates three indicators: traffic interference (X7), cost (X8), and service life (X9). The fundamental definitions of the criterion layer C and the indicator layer X are presented in Table 1.

Table 1. Definitions of decision-making indicators and criterions for pavement preventive maintenance schemes.

<table><tr><td>Criteria</td><td>Definition</td><td>Indicator</td><td>Definition</td></tr><tr><td rowspan="3">Service function</td><td rowspan="3">Criteria evaluate transpor- tation needs and other ser-. vice requests.</td><td>Riding comfort (Score)</td><td>The degree of turbulence of the vehicle</td></tr><tr><td>Appearance (Score)</td><td>The beautification degree of road surface</td></tr><tr><td>Noise (Score)</td><td>Noise generated during construction</td></tr><tr><td rowspan="3">Pavement perfor- mance</td><td rowspan="3">Criteria evaluate the func- tional characteristics of road surfaces and struc- tures.</td><td>Road quality index (Score)</td><td>The cumulative vertical displacement value of a quarter-car at a speed of 80 km/h</td></tr><tr><td>Pavement condition index (Score)</td><td>Pavement damage rate</td></tr><tr><td>Skid resistance index (Score)</td><td>Pavement friction coefficient or roughness.</td></tr><tr><td rowspan="2">Criteria evaluate the cost Economic effec- and benefits generated by</td><td rowspan="2"></td><td colspan="2">Traffic disruption caused by construction Traffic interference (Score)</td></tr><tr><td>Material cost (Yuan/m²)</td><td>Purchase cost of materials</td></tr><tr><td>tiveness</td><td>maintenance.</td><td>Service life (Year)</td><td>Evaluation of material utilization benefits</td></tr></table>

The qualitative indicators X1, X2, and X3 pertain to the functionality of the road service, whereas X7, X8, and X9 relate to the economic benefits of pavement maintenance. The quantitative indicators X4, X5, and X6 concern the technical condition of the pavement, and their specific calculation formulas are introduced subsequently.

The Road Travelling Quality Index X4 (RQI) is defined by the deviation value of the amount of concavity and convexity in the longitudinal direction of the road surface. This is shown in Equation (1):

$$
\mathrm{RQI}=\frac{100}{1+a_{0}\mathrm{e}^{a_{1}\mathrm{IRI}}}\tag{1}
$$

where IRI is the international flatness index (m/km); a0 is the model parameter, 0.026 is used for motorways and first-class highways, and 0.0185 is used for other class highways; a1 is the model parameter, 0.65 is used for motorways and first-class highways, and 0.58 is used for other class highways.

The Pavement Condition Index (PCI) is a quantitative scoring and rating system that considers the type and severity of pavement distress. A score of 0–100 is assigned, with higher scores indicating a superior condition. The PCI is calculated according to Equations (2) and (3):

$$
\mathrm{PCI}=100-a_{0}\mathrm{DR}^{a_{1}}\tag{2}
$$

$$
DR  = 100 \times \frac{\sum\limits_{ i =1}^{ i _0} w_{ i } A _{ i }}{ A }\tag{3}
$$

where DR represents the pavement damage rate (%), the parameter a0 is equal to 15.00; a1 is 0.412, Ai denotes the cumulative area of pavement damage in category i (m<sup>2</sup>); A is the area of pavement detection or investigation (m<sup>2</sup>); wi is the weight or conversion coefficient of the pavement damage in category i, as shown in Table $2 ;$ and i is the type of pavement damage, including the degree of damage (light-L, medium-M, and heavy-H); i0 is the total number of damage types.

Table 2. Asphalt pavement damage types, weights, and conversion factors.

<table><tbody><tr><td>Type (i)</td><td>Category</td><td>Degree</td><td>Unit(m<sup>2</sup>)</td><td>Weights (wi)</td><td>Conversion Factors (Auto-Detection)(wi)</td></tr><tr><td>1</td><td></td><td>L</td><td></td><td>0.6</td><td></td></tr><tr><td>23</td><td>Alligator cracks</td><td>M H</td><td>Area</td><td>0.81.0</td><td>1.0</td></tr><tr><td>4</td><td></td><td>L</td><td></td><td>0.6</td><td></td></tr><tr><td></td><td>Massive cracks</td><td></td><td>Area</td><td></td><td>0.8</td></tr><tr><td>5</td><td></td><td>H</td><td></td><td>0.8</td><td></td></tr><tr><td>6<sub>7</sub></td><td>Longitudinal cracks</td><td><sub>H</sub>L</td><td>Length × 0.2 m</td><td>0.61.0</td><td>2.0</td></tr><tr><td>8<sub>9</sub></td><td>Transverse cracks</td><td><sub>H</sub>L</td><td>Area × 0.2 m</td><td>0.61.0</td><td>2.0</td></tr><tr><td>10</td><td rowspan="3">Settlement</td><td>L H</td><td rowspan="3"></td><td>0.6</td><td rowspan="3">1.0</td></tr><tr><td>11</td><td>Area</td><td>1.0</td></tr><tr><td>12</td><td>L</td><td>0.6</td></tr><tr><td>13</td><td rowspan="2">Rutting</td><td>H</td><td rowspan="2">Length ×0.4 m</td><td>1.0</td><td rowspan="2">1</td></tr><tr><td>14</td><td>L</td><td>0.6</td></tr><tr><td>15</td><td rowspan="2">Distortion</td><td>H</td><td rowspan="2">Area</td><td>1.0</td><td rowspan="2">1.0</td></tr><tr><td>16</td><td>L</td><td>0.8</td></tr><tr><td>17</td><td rowspan="2">Potholes</td><td>H</td><td rowspan="2">Area</td><td>1.0</td><td rowspan="2">1.0</td></tr><tr><td>18</td><td>L</td><td></td></tr><tr><td></td><td rowspan="2">Raveling</td><td>H</td><td rowspan="2">Area</td><td>0.6</td><td rowspan="2">1.0</td></tr><tr><td>19 20</td><td></td><td>1.0</td></tr><tr><td></td><td>Flushing</td><td></td><td>Area</td><td>0.2</td><td>0.2</td></tr><tr><td rowspan="2">21</td><td rowspan="2">Patches</td><td></td><td rowspan="2">Area or Length × 0.2</td><td rowspan="2">0.1</td><td rowspan="2">0.1 (0.2)</td></tr><tr><td>m</td></tr></tbody></table>

The road surface skid resistance index (SRI) X6 is the amount of friction generated by the vehicle and tires during the sliding process and can be calculated according to Equation (4):

$$
\mathrm{SRI}=\frac{100-\mathrm{SRI}_{\min }}{1+a_{0} \mathrm{e}^{a_{1} \mathrm{SFC}}}+\mathrm{SRI}_{\min }\tag{4}
$$

where SFC is the transverse force coefficient, the calibration parameter $\mathrm { S R I _ { m i n } }$ is 35.0, the model parameter a0 is 28.6; the model parameter a1 is −0.105.

## 2.2. Calculation of Evaluation Criteria Weights

This subsection presents the relative importance and assigned weights of the evaluation criteria. The research team comprised two experts from a provincial road testing center, one graduate supervisor in road engineering, and three master’s and doctoral researchers in road engineering. A 1 km road section is selected as the evaluation unit. The extent to which different factors influence the selection of preventive scheme varies. This paper describes the influence of each indicator on the specified criteria by establishing a pairwise comparison matrix through AHP and comparing and scoring the importance of each criterion in the evaluation system by the members of the research group. The weights of criteria and indicator are determined through a literature research combined with the opinions provided by all the experts in the research group. The consistency of the experts’ opinions on the weights of the criteria obtained is verified, and calculations are conducted to ascertain the final average weight of the criteria for which consistency is achieved.

## Step 1: Constructing a comparison matrix

In this study, a comparison scale is employed to evaluate the relative importance of two decision-making schemes. The fuzzy mathematical method is used to establish guidelines for a two-by-two comparison scale. The definition of the comparison scale is pre-sented in Table 3.

Table 3. Scale of comparison.

| The Verbal Expression Judgments of the Preference | Numerical Expression |
| --- | --- |
| Absolute importance over $x _ { i }$ $y _ { i }$ | 9 |
| Between absolute and demonstrated importance $x _ { i }$ over $y _ { i }$ | 8 |
| Demonstrated importance over |  |
| Between demonstrated and essential or strong importance over | 76 |
| Essential or strong importance over | 5 |
| Between essential or strong and weak importance over | 4 |
| Weak importance over | 3 |
| Between weak and equal importance over | 2 |
| Equal importance over | 1 |
| Between weak and equal importance over | 1/2 |
| Weak importance over | 1/3 |
| Between essential or strong and weak importance over | 1/4 |
| Essential or strong importance over | 1/5 |
| Between demonstrated and essential or strong importance over | 1/6 |
| Demonstrated importance over | 1/7 |
| Between absolute and demonstrated importance over | 1/8 |
| Absolute importance over | 1/9 |

The values of the comparison matrix are determined by an expert survey [31,32], and the comparison matrix A is obtained, as shown in Equation (5):

$$
\mathbf{A} = \left| \mathbf{a}_{\mathrm{ij}} \right|_{\mathrm{m} \times \mathrm{n}} = \begin{array}{c|cccc}& \mathbf{y}_{1} & \mathbf{y}_{2} & \cdots & \mathbf{y}_{\mathrm{n}} \\\hline\mathbf{x}_{1} & \mathbf{a}_{11} & \mathbf{a}_{12} & \cdots & \mathbf{a}_{1\mathrm{n}} \\\hline\mathbf{x}_{2} & \mathbf{a}_{12} & \mathbf{a}_{22} & \cdots & \mathbf{a}_{2\mathrm{n}} \\\vdots & \vdots & \vdots & \vdots & \vdots \\\mathbf{x}_{\mathrm{m}} & \mathbf{a}_{\mathrm{n}1} & \mathbf{a}_{\mathrm{n}2} & \cdots & \mathbf{a}_{\mathrm{mn}} \\\end{array}\tag{5}
$$

## Step 2: Calculation of weighting factors

The normalized matrix is weighted and averaged to obtain the eigenvector. Each element of the eigenvector represents the weight of the corresponding criterion and is calculated as follows.

1. Normalize the comparison matrix A by columns as in Equation (6).

$$
\overline{a}_{ij} = \frac{a_{ij}}{\sum\limits_{j = 1}^{n} a_{ij}} \mathrm{i}, j = 1,2,\cdots n\tag{6}
$$

2. As in Equation $( 7 ) ,$ , the column means of matrix A are normalized by columns and summed by rows to obtain the sum. This sum is then normalized to obtain the weight coefficients of Equation (8).

$$
\mathrm{PCI}=100-a_{0}\mathrm{DR}^{a_{1}}\tag{7}
$$

$$
DR  = 100 \times \frac{\sum\limits_{ i =1}^{ i _0}  w _{ i }  A _{ i }}{ A }\tag{8}
$$

The weighting coefficients of the factors are calculated by the above steps, where the weighting coefficient of the evaluation indicators of the criterion layer in relation to the target layer is $\mathbf{W} = \begin{bmatrix} \mathbf{W}1 & \mathbf{W}2 & \mathbf{W}3 \end{bmatrix}$

## Step 3: Consistency test

A threshold is established by the consistency ratio (CR) in order to ascertain whether the results are valid or not, with the aim of eliminating inaccurate responses and evaluating the decision-maker’s decision-making ability [33-34]. The test steps are illustrated in Equations (9)–(11).

1. Compute the largest characteristic root $\lambda _ { \mathrm { ~ m a x } }$ of the comparison matrix A:

$$
\lambda_{\max }=\frac{1}{\mathrm{n}} \sum_{\mathrm{i}=1}^{\mathrm{n}} \frac{(\mathrm{AW})_{\mathrm{i}}}{\mathrm{Wi}}\tag{9}
$$

## 2. Calculation of consistency indicators:

$$
CI  = \frac{\lambda_{\max} -  n }{ n  - 1}\tag{10}
$$

When $\mathrm { C I }   =   0   , \mathrm { A }$ is a consistency matrix, and the smaller the value, the better the consistency of A.

## 3. Calculation of the consistency ratio:

$$
\mathrm { C R   =   } \frac { \mathrm { C I } } { \mathrm { R I } }\tag{11}
$$

RI is a stochastic consistency indicator, the values of which are determined through Table 4.

Table 4. Values of RI.

| Determining Matrix Order | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RI | 0 | 0 | 0.58 | 0.9 | 1.12 | 1.24 | 1.32 | 1.41 | 1.45 | 1.49 | 1.51 |

4. The accuracy of the judgment of the comparison matrix and the applicability of the weighting coefficients are determined based on the results of the consistency ratio calculation. If CR 0.1 ＜ , the judgment is accepted, the comparison matrix is deemed to be within the preset tolerance range. Otherwise, the comparison matrix is considered to be out of the preset tolerance range, and the matrix must be adjusted and recalculated.

## 2.3. Comprehensive Scheme Evaluation and Ranking

The third step of the methodology presented in this paper is used to prioritize the scheme. This subsection synthesizes the weights of the indicators determined by AHP-TOPSIS. Specifically, the weights of each computational attribute are determined by AHP, the decision matrix is weighted, and the selected alternatives are prioritized using TOPSIS. The method calculates the similarity distance of the alternatives to the positive and negative ideal solutions and is optimal when the object is closest to the positive ideal solution and furthest from the negative ideal solution, and vice versa. Multiple alternatives are directly evaluated and ranked by the method to determine the optimal solution. The main implementation steps of the method are as follows.

Step 1: Create an initial decision matrix

Let the scheme set be $\mathrm { A } = \{ \mathrm { A } _ { 1 } , \mathrm { A } _ { 2 } , \cdots , \mathrm { A } _ { \mathrm { m } } \}$ , the set of all scheme evaluations $\mathtt { X } =$ $\{ \mathrm { X } _ { 1 } , \mathrm { X } _ { 2 } , \mathrm { X } _ { 3 } , \ldots , \mathrm { X } _ { \mathrm { n } } \} ,$ , and the evaluation index $X _ { i j }$ denotes the $\mathbf { j } \mathbf { \mathrm { t h } }$ evaluation index of the ith program, where $\mathrm{i} \in [1, \mathrm{m}], \mathrm{j} \in [1, \mathrm{m}]$ , and the initial decision matrix can be expressed as Equation (12).

$$
\mathrm{A}=(\mathrm{X}_{\mathrm{ij}})_{\mathrm{m} \times \mathrm{n}}\begin{bmatrix}\mathrm{X}_{11} & \mathrm{X}_{12} & \cdots & \mathrm{X}_{1 \mathrm{n}} \\\mathrm{X}_{21} & \mathrm{X}_{22} & \cdots & \mathrm{X}_{2 \mathrm{n}} \\\vdots & \vdots & \ddots & \vdots \\\mathrm{X}_{\mathrm{m} 1} & \mathrm{X}_{\mathrm{n} 2} & \cdots & \mathrm{X}_{\mathrm{mn}}\end{bmatrix}\tag{12}
$$

## Step 2: Derive a standardized decision matrix

The evaluation indicators of the options can be classified into two categories: positive and negative. Positive indicators are indicative of a favorable outcome, whereas negative indicators are indicative of an unfavorable outcome. In order to eliminate the influence of different scales of evaluation indicators, all evaluation indicators are standardized according to the normalization method.

For the standardized decision matrix $\mathbf { B } = \left( \mathbf { b } _ { \mathrm { i j } } \right) _ { \mathrm { m } \times \mathrm { n } ^ { \prime } }$ , the calculation varies depending on the positive and negative characteristics of the indicator.

For the positivity indicators, there are:

$$
\mathrm{b_{ij}} = \frac{\mathrm{X_{ij}} - \min\limits_{\mathrm{j}} (\mathrm{X_{ij}})}{\max\limits_{\mathrm{j}} (\mathrm{X_{ij}}) - \min\limits_{\mathrm{j}} (\mathrm{X_{ij}})}\tag{13}
$$

For reverse sex indicators, there are:

$$
\mathrm{bij} = \frac{\max(X_{ij}) - X_{ij}}{\max(X_{ij}) - \min(X_{ij})}\tag{14}
$$

The weighted normalized decision matrix $\mathbf { C } ,$ as illustrated in Equation (15), is obtained by multiplying the column vectors of matrix B with the total ranking weights nW, which have been determined by the AHP for the indicator stratum layer.

$$
\mathbf{C}=(\mathrm{c} \mathrm{i}) \mathrm{m} \times \mathrm{n}\left[\begin{array}{cccc}\mathrm{w} \mathrm{i} \mathrm{b}_{11} & \mathrm{w}_{2} \mathrm{b}_{12} & \cdots & \mathrm{w}_{n} \mathrm{b}_{1 n} \\\mathrm{w} \mathrm{i} \mathrm{b}_{21} & \mathrm{w}_{2} \mathrm{b}_{22} & \cdots & \mathrm{w}_{n} \mathrm{b}_{2 n} \\\vdots & \vdots & \ddots & \vdots \\\mathrm{w}_{1} \mathrm{b}_{\mathrm{m} 1} & \mathrm{w}_{2} \mathrm{b}_{\mathrm{m} 2} & \cdots & \mathrm{w}_{n} \mathrm{b}_{\mathrm{mn}}\end{array}\right]\tag{15}
$$

## Step 3: Determine the ideal solution

In accordance with the nature of the decision problem, a positive ideal solution and a negative ideal solution are identified. The positive ideal solution represents the combi nation of optimal values across all evaluation indicators, whereas the negative ideal solution represents the combination of worst values across all evaluation indicators. The positive ideal solution $\mathbb { C } ^ { + }$ of the positive index set $J _ { 1 }$ is the maximum value of the row vector in the weighted normalized decision matrix C, the negative ideal value is the minimum value, while the reverse index takes the opposite value, expressed as Equation (16).

$$
\mathrm{C}^{+} = \left\{ (\max c_{ij} \mid j \in \mathrm{J}_1), (\min c_{ij} \mid j \in \mathrm{J}_2) \right\}, \quad \mathrm{C}^{-} = \left\{ (\min c_{ij} \mid j \in \mathrm{J}_1), (\max c_{ij} \mid j \in \mathrm{J}_2) \right\}\tag{16}
$$

where $\mathbb { C } ^ { + }$ and $\mathbb { C } ^ { - }$ are positive and negative ideal solutions, respectively.

Step 4: Calculate the similarity distance

The distance between the judgment object and the ideal solution is calculated as shown in Equation (17).

$$
\mathbf{d}_{\mathbf{i}}^{+} = \sqrt{\sum_{j = 1}^{\mathbf{n}} \left( \mathbf{C}\mathbf{i}j - \mathbf{C}_{\mathbf{j}}^{+} \right)^{2}} , \quad \mathbf{d}_{\mathbf{i}}^{-} = \sqrt{\sum_{j = 1}^{\mathbf{n}} \left( \mathbf{C}\mathbf{i}j - \mathbf{C}_{\mathbf{j}}^{-} \right)^{2}}\tag{17}
$$

where $d _ { i } ^ { + }$ and $\mathbf { d } _ { \mathbf { i } } ^ { - }$ are the distances of the evaluation object from the positive and negative ideal solutions, respectively; $c _ { \mathrm { J } } ^ { + }$ and $\mathbf { c } _ { \mathrm { J } } ^ { - }$ are the corresponding elements in $\mathbb { C } ^ { + }$ and $\mathbb { C } ^ { - }$

Evaluate the closeness of the object to the positive ideal solution according to Equation (18).

$$
\mathrm{E}_{\mathrm{i}}^{+}=\mathrm{d}_{\mathrm{i}}^{+} / \mathrm{d}_{\mathrm{i}}^{+}+\mathrm{d}_{\mathrm{i}}^{-}, 0 \leq \mathrm{E}_{\mathrm{i}}^{+} \leq 1\tag{18}
$$

The closeness $\mathrm { E _ { i } ^ { + } }$ reflects the degree of proximity of the evaluation object to the positive ideal solution and its distance from the negative ideal solution. When the evaluation object is a positive ideal solution, $\mathrm { E _ { i } ^ { + }   =   1 } ;$ conversely, when the evaluation object is a negative ideal solution, $\mathrm { E _ { i } ^ { + } = 0 }$ . The evaluation object is typically situated between the positive and negative ideal solutions, with a proximity to the positive ideal solution of between 0 and 1. Consequently, only the evaluation objects exhibiting a proximity to the positive ideal solution are generally considered, with those closer to 1 being deemed more favorable.

Step 5: Comprehensive scheme evaluation

Calculate the vector of comprehensive judgment results for the judgment object according to Equation (19).

$$
\mathbf { F } = \mathbf { W } \times \mathbf { E }\tag{19}
$$

where E is the judgment matrix composed of the closeness of each judgment object to the positive ideal solution; 𝑊𝑊 is the comprehensive weight of each evaluation index calculated by the hierarchical analysis method.

## 3. Case Study

## 3.1. Program Overview

In this study, the research section was divided into multiple evaluation units of approximately 1 km in length. This is consistent with the investigation and evaluation units specified in the “Highway Performance Assessment Standard” (JTG 5210—2018) [35]. Simultaneously, it should be noted that the units for section evaluation and scheme selec tion are not considered to be fixed. This is because, in practical applications, various typical distresses may appear within a 1 km evaluation unit, and the score obtained from the regulations is merely an average value. It can be reasonably argued that the more finely the section units are subdivided, the more accurately the actual condition of the pavement can be represented. However, this would undoubtedly result in an increased workload for the inspection units. Therefore, the length of the evaluation units can be determined based on the specific research requirements. Furthermore, the research team conducted an on-site assessment of the study section and assigned priority scores to the applicability of alternative schemes on this section, according to each decision-making indicator. Ultimately, The AHP-TOPSIS method was employed to integrate the criterion weights de rived from AHP with the priority scores derived from TOPSIS, thus facilitating the ranking of preventive maintenance schemes for highway sections. This approach was undertaken to substantiate the efficacy of the method in question.

The present study employed a section of the national highway G353 situated within the Shangrao segment of Jiangxi Province, China, as the subject of its investigation. The pavement type of this section is asphalt concrete, with a technical grade of second-class highway, and the section length is 6 km. The selected pavement surface condition data comprise indicators related to pavement condition evaluation, including PQI, PCI, RQI, and SRI, with an evaluation unit of 1 km. The summary results of the pavement performance are presented in Table 5.

Table 5. Pavement performance data.

| Starting Stake Number | Ending Stake Number | PQI | Assessment Grade | PCI | RQI | SRI |
| --- | --- | --- | --- | --- | --- | --- |
| 534 | 534.73 | 92.5 | Excellent | 93.5 | 91 | 87.5 |
| 534.73 | 536 | 96.0 | Excellent | 98.4 | 92.4 | 88.2 |
| 536 | 537 | 97.4 | Excellent | 99.2 | 94.6 | 89.5 |
| 537 | 537.997 | 92.3 | Excellent | 91 | 94.3 | 88.6 |
| 537.997 | 539 | 96.2 | Excellent | 97.7 | 93.9 | 89.9 |
| 539 | 540 | 96.8 | Excellent | 98.1 | 94.8 | 88.7 |
| 540 | 541.15 | 95.1 | Excellent | 95.6 | 94.4 | 87.6 |

## 3.2. Identification of Alternative Schemes

A variety of sources are employed in the construction of potential schemes that are capable of achieving the stated objectives and satisfying the specified criteria. These include industry practice, historical data, and expert experience. Subsequently, the aforementioned schemes are integrated into the model as the scenario layer, which serves as a framework and provides guidance for subsequent comparison, assessment, and decisionmaking.

Preventive maintenance technologies for asphalt pavement can be classified into distinct categories, including seal coating, overlay, and in-place hot recycling. In accordance with the stipulations set forth in the “Technical Specifications for Preventive Maintenance of Highway Asphalt Pavement” (JTG/T 5142-01-2021) [13], the array of common preventive maintenance schemes encompasses the following ten techniques: fog seal, chip seal, fiber-reinforced seal, slurry seal, composite seal, micro-surfacing, thin layer covering, ultra-thin layer covering, seal layer overlay and in-place hot recycling. The applicable highway classifications for these methods are presented in Table $6 ,$ and the corresponding road condition level requirements for each class of road are shown in Table 7.

Table 6. Highway classifications for preventive maintenance schemes.

<table><tbody><tr><td rowspan="2">Highway Classifica-tions</td><td colspan="9">Preventive Maintenance Schemes</td></tr><tr><td>Fog Seal</td><td>Chip Seal andFiber-Reinforced Seal</td><td>Slurry Seal</td><td>Micro-Surfacing</td><td>Composite Seal</td><td>Thin Layer Covering</td><td>Ultra-Thin Overlay</td><td>Seal Layer Overlay</td><td>In-PlaceHot Recycling</td></tr><tr><td>Expressway</td><td>√</td><td>×</td><td>×</td><td>√</td><td>√</td><td>√</td><td>√</td><td>√</td><td>√</td></tr><tr><td>First-class highway</td><td>√</td><td>×</td><td>×</td><td>√</td><td>√</td><td>√</td><td>√</td><td>√</td><td>√</td></tr><tr><td>Second-class highway</td><td>√</td><td>√</td><td>√</td><td>√</td><td>√</td><td>√</td><td>○</td><td>√</td><td>√</td></tr><tr><td>Third-class highway</td><td>√</td><td>√</td><td>√</td><td>○</td><td>√</td><td>√</td><td>○</td><td>√</td><td>×</td></tr><tr><td>Fourth-class highway</td><td>√</td><td>√</td><td>√</td><td>○</td><td>√</td><td>√</td><td>○</td><td>√</td><td>×</td></tr></tbody></table>

Where √ represents applicable, × represents not applicable, and ○ represents optional.

Among these, fog seal, chip seal, slurry seal, micro-surfacing, composite seal, thin overlays, ultra-thin overlays, and seal layer overlay are all applicable for second-class highways and lower-grade highways.

Table 7. Pavement condition levels suitable for maintenance technologies.

| Ma | intenance Technologies | Pavement Condition Levels | Second-Class High-way | Third-andFourth-Class Highway |
| --- | --- | --- | --- | --- |
| Seal | Fog seal Chip sealandFiber-reinforced seal Slurry seal Micro-surfacing Composite seal | PCI, RQI, RDI SRI PCI, RQI, RDI PCI, RQI, RDI PCI, RQI PCI, RQI, RDI | ≥90≥80≥82≥85≥85≥80 | ≥8-5≥80≥80≥80≥75 |
| Overlay | Thin layer covering Ultra-thin layer covering Seal layer overlay | PCI, RQI PCI, RQI PCI, RQI | ≥80≥80≥80 | ≥83≥80≥80 |

In the survey of the maintenance history of national highways in Jiangxi Province, it was found that slurry seal, micro-surfacing, chip seal, and ultra-thin overlays are relatively common preventive maintenance technologies. Therefore, this study chooses these four commonly used preventive maintenance schemes for prioritization based on local engineering practice verification, extensive application experience, and proven effectiveness in implementation.

## 3.3. Assessment Framework

In order to gain a deeper understanding of the decision-making processes involved in the implementation of preventive maintenance schemes on national trunk highways, it is essential to apply the AHP to categorize the various scheme criteria. By building upon the identification of the most commonly used preventive maintenance options in Jiangxi Province, a decision-making evaluation hierarchy model for preventive maintenance schemes was established. According to the model depicted in Figure 3, the general target layer is represented by O, the criterion layer by P, and the indicator layer by X.

![](images/page_11_image_5.jpg)

Figure 3. Analytic hierarchy process model.

Scores were assigned to indicators such as traffic disruption during construction, post-maintenance driving comfort, skid resistance, noise levels, and appearance for the four maintenance measures. The results are presented in Table 8.

Table 8. Ratings of attributes for four maintenance schemes.

| Influencing Factors | Chip Seal | Slurry Seal | Micro-Surfacing | Ultra-Thin Overlays |
| --- | --- | --- | --- | --- |
| Driving Comfort | 2-4 | 2-4 | 3-5 | 3-5 |
| Appearance | 3-5 | 4-5 | 4-5 | 4-5 |
| Noise | 1-2 | 3-5 | 2-4 | 3-5 |
| Smoothness | 2-4 | 3-5 | 4-5 | 4-5 |
| Damage | 2-4 | 3-5 | 3-5 | 3-5 |
| Skid Resistance | 4-5 | 3-5 | 3-5 | 4-5 |
| Traffic Disruption | 1-2 | 3-5 | 4-5 | 3-5 |

The study employs a uniform evaluation system based on the scoring criteria, whereby higher scores indicate superior performance in corresponding attributes. This approach is intended to facilitate the consistent assessment of both qualitative and quantitative indicators, with a view to enhancing the decision-making process in the context of pavement preventive maintenance. The selected preventive maintenance schemes, namely slurry seal (Scheme I), micro-surfacing (Scheme II), chip seal (Scheme III), and ultra-thin overlays (Scheme IV), have been categorized according to a four-point scale, with excellent (0.8, 1), good (0.7, 0.8), fair (0.6, 0.7), and poor (0, 0.6) being the assigned values. The objective of this evaluation is to establish a comprehensive assessment framework, as illustrated in Table 9, based on the technical conditions of the example road sections studied through research group discussions and surveys.

Table 9. Comprehensive evaluation criteria system for each scheme.

| Goal Criterion Layer | Indicator Layer | I | II | III | IV |
| --- | --- | --- | --- | --- | --- |
|  | X1 | 0.75 | 0.65 | 0.55 | 0.75 |
| Technical Condition P1 | X2X3 | 0.850.65 | 0.850.75 | 0.750.65 | 0.850.75 |
|  | X4 | 0.75 | 0.75 | 0.65 | 0.65 |
| Usability Performance P2 | X5X6 | 0.650.55 | 0.750.55 | 0.650.75 | 0.850.85 |
|  | X7 | 0.85 | 0.85 | 0.75 | 0.85 |
| Comprehensive Benefits P3 | X8/(Year)X9/(Yuan/m<sup>2</sup>) | 2.522.5 | 2.526.5 | 220.5 | 2.532.5 |

## 4. Results and Discussion

## 4.1. Comprehensive Evaluation of Indicators

In accordance with the fundamental tenets of AHP, the evaluation of indicators pertaining to the preventive maintenance of national and provincial highways can be represented in a judgment matrix, as illustrated in Figure 4.

| Criteria | Servicefunction | Pavement performance | Economic effectiveness |
| --- | --- | --- | --- |
| Service function | 1 | 1/4 | 1/2 |
| Pavement performance | 4 | 1 | 3/2 |
| Economic effectiveness | 2 | 2/3 | 1 |
| Weights | 0.1463 | 0.5317 | 0.3220 |
| Consistency testing | λ<sub>max</sub>= 3.0092 | CI = 0.0046 | CR=0.0088&lt;0.1 |

Figure 4. Judgment matrix based on target layers.

Figure 4 illustrates the matrix comparison and calculation process, including the construction of the evaluation matrices and the results of the weighting calculations. When selecting preventive maintenance schemes for national trunk roads, decision-makers should prioritize schemes that minimize costs while maximizing pavement performance, taking into account the pavement performance and service functions of these roads. Pavement performance is therefore considered to be the primary selection criterion, with economic efficiency being somewhat less important. As pavement performance mainly affects high-quality trunk roads and national trunk roads are mainly secondary and lowerquality roads, service functions are considered to be relatively less important. The consistency ratio (CR) of 0.0088 < 0.1 indicates that the matrix meets the requirements of the consistency test. Therefore, the weight vector W = [0.1463, 0.5317, 0.3220] is acceptable.

Similarly, the judgment matrices and weighting coefficients determined by the evaluation of the service functions, pavement performance, and economic efficiency criteria

layers are shown in Figure 5a–c. Decision-makers provide criteria for judging the correlation between refined indicators and criteria.

| n | Indicator | Riding comfort | Appearence | Noise |
| --- | --- | --- | --- | --- |
| <sub>it</sub><sup>o</sup>c | Riding comfort | 1 | 5 | 3 |
| f<sup>n</sup><sub>u</sub> | Appearence | 1/5 | 1 | 1/2 |
| iec | Noise | 1/3 | 2 | 1 |
| v |  |  |  |  |
| <sup>r</sup>e | Weights | 0.6483 | 0.1220 | 0.2297 |
| S | Consistency testing | λ<sub>max</sub> = 3.0037 | CI = 0.0018 | CR=0.0036&lt;0.1 |

(a)

<table><tr><td rowspan=6>perrncePaent</td><td>Indicator</td><td>Road Quality</td><td>PavementCondition</td><td>SkiddingResistance</td></tr><tr><td>Road Quality</td><td>1</td><td>1/3</td><td>1/2</td></tr><tr><td>Pavement Condition</td><td>3</td><td>1</td><td>3</td></tr><tr><td>Skidding Resistance</td><td>2</td><td>1/3</td><td>1</td></tr><tr><td rowspan=2 colspan=2>Weights                  0.3478Consistency testing       $\lambda_{\max} = 3.0012$ </td><td>0.5402</td><td>0.1119</td></tr><tr><td>CI = 0.0006</td><td> $CR = 0.0012 < 0.1$ </td></tr></table>

(b)

| Indicator | Traffic interference | Material cost | Service life |
| --- | --- | --- | --- |
| Traffic interference | 1 | 1/2 | 1/3 |
| Material cost | 2 | 1 | 2/3 |
| Service life | 3 | 3/2 | 1 |
| Weights | 0.1667 | 0.3333 | 0.5000 |
| Consistency testing | λ<sub>max</sub> = 3.0000 | CI = 0.0000 | CR=0.0000&lt;0.1 |

(c)

Figure 5. (a). Judgment matrix based on service function. (b). Judgment matrix based on pavement performance. (c). Judgment matrix based on economic effectiveness

The CR values determined for each criterion are 0.0036, 0.0012, and 0, respectively, all of which are less than 0.1, meeting the consistency judgment requirements. Therefore, the weights of each criterion layer are considered acceptable.

Figure 5a shows the judgment matrix based on technical conditions. It is evident that, on lower-grade roads, drivers prioritize driving comfort, followed by road noise during operation, with less emphasis placed on the aesthetic appearance of the road.

Figure 5b shows the judgment matrix based on usability performance. According to the current “Highways Performance Assessment Standard” (JTG 5210—2018) [35] in China, weights are assigned based on the assessment of pavement conditions. The degree of PCI and RQI are deemed critical factors in assessing pavement conditions on lowergrade roads, with PCI slightly more significant than RQI. The impact of SRI on pavement is nearly negligible in this assessment.

Figure 5c shows the judgment matrix for indicators related to economic effectiveness such as traffic interference, cost, and service life. The service life of the scheme is considered most important because enhancing road longevity is crucial in material design considerations. Following this, the cost of materials and construction is prioritized, while the interference to traffic during construction is deemed least important.

After establishing the comparison matrices for each level and calculating the individual weights, we calculated the overall weights of each indicator for the total objective using Equation (20).

$$
\mathfrak { W } _ { \mathrm { c r i t e r i o n } } = \sum _ { \mathfrak { n } } \mathfrak { W } _ { \mathrm { i n d i c a t o r } } \times \mathfrak { W } _ { \mathrm { r e g a d i n g ~ c r i t e r i o n } }\tag{20}
$$

The overall ranking of the indicator levels is shown in Table 10.

Table 10. Overall ranking weights of indicator levels.

<table><tr><td rowspan="2">P-X Ranking</td><td colspan="3">O-P Ranking</td><td rowspan="2">Overall Ranking Weights</td></tr><tr><td>W1= 0.1463</td><td>W₂= 0.5317</td><td>W3= 0.3220</td></tr><tr><td>X1</td><td>0.6483</td><td></td><td></td><td>0.0948</td></tr><tr><td>X2</td><td>0.1220</td><td></td><td></td><td>0.0179</td></tr><tr><td>X3</td><td>0.2297</td><td></td><td></td><td>0.0336</td></tr><tr><td>X₄</td><td></td><td>0.3478</td><td></td><td>0.1849</td></tr><tr><td>X5</td><td></td><td>0.5402</td><td></td><td>0.2873</td></tr><tr><td>X6</td><td></td><td>0.1119</td><td></td><td>0.0595</td></tr><tr><td>X7</td><td></td><td></td><td>0.1667</td><td>0.0536</td></tr><tr><td>X8</td><td></td><td></td><td>0.3333</td><td>0.1074</td></tr><tr><td>X9</td><td></td><td></td><td>0.5000</td><td>0.1610</td></tr></table>

This method can be widely applied and referenced in similar studies, but the selection of decision criteria and calculation of weights should be tailored to specific application contexts.

In this section, the TOPSIS method is used to comprehensively evaluate indicators from three subcriteria layers: technical conditions, usability performance, and overall benefits. First, an initial evaluation matrix was constructed, and the matrix was normalized by weighting using AHP weights. Then, the positive and negative ideal solutions for each system were calculated, along with their proximity to the positive ideal solution, to determine the optimal solutions corresponding to the different indicator levels.

Within the service function criteria layer, indicators such as driving comfort (X1), appearance (X2), and noise (X3) are considered positive indicators. In the technical conditions layer, quality index (X4), pavement damage (X5), and skid resistance (X6) are also positive indicators. Regarding overall benefits, material cost (X8) is a negative indicator, while traffic interference (X7) and service life (X9) are positive indicators. The positive and negative ideal solutions for each indicator are calculated as shown in Table 11.

Table 11. Positive ideal and negative ideal solutions for each indicator.

|  | X1 | X2 | X3 | X4 | X5 | X6 | X7 | X8 | X9 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| c+j | 0.099 | 0.041 | 0.017 | 0.149 | 0.296 | 0.149 | 0 | 0.148 | 0.062 |
| c-j | 0 | 0 | 0 | 0 | 0 | 0 | 0.039 | 0 | 0 |

According to Equation (12), considering service function, pavement performance, and economic effectiveness indicators, establish the initial judgment matrix as shown in Figure 6a,b.

|  | c（RoSmicdofirnoe）rgt | Ap（peScaorrea）nce | （NScoories）e | Q（RuSocaoarleid）ty | CPao（vnSedcmoirteei）onnt | RSe（ksSiiscdotrdae）nincge | intTe（rrSfaceofrrfee）icnce | （MYa cuatones/rt mia<sup>2</sup>）l | S（eY lriefvaeri）ce |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Slurry seal | 3.75 | 4.25 | 3.25 | 95 | 93 | 91 | 4.25 | 2.5 | 22.5 |
| Micro-surfacing | 3.25 | 4.25 | 3.75 | 95 | 95 | 91 | 4.25 | 2.5 | 26.5 |
| Chip seal | 2.75 | 3.75 | 3.25 | 93 | 93 | 95 | 3.75 | 2 | 20.5 |
| NovaChip | 3.75 | 4.25 | 3.75 | 93 | 97 | 97 | 4.25 | 2.5 | 32.5 |

(a)

|  | Riding comfort | Appearence | Noise | Road Quality | Pavement Condition | Skidding Resistance | Traffic interference | Material cost | Service life |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Slurry seal | 0.75 | 0.85 | 0.65 | 0.75 | 0.65 | 0.55 | 0.85 | 2.5 | 22.5 |
| Micro- surfacing | 0.65 | 0.85 | 0.75 | 0.75 | 0.75 | 0.55 | 0.85 | 2.5 | 26.5 |
| Chip seal | 0.55 | 0.75 | 0.65 | 0.65 | 0.65 | 0.75 | 0.75 | 2 | 20.5 |
| NovaChip | 0.75 | 0.85 | 0.75 | 0.65 | 0.85 | 0.85 | 0.85 | 2.5 | 32.5 |

(b)

Figure 6. (a) Initial judgment matrix (original value). (b) Initial judgment matrix (normalized value).

Calculate the weighted normalized decision matrix according to Equations (13)–(15). The calculation results are shown in Figure 7.

|  | Riding comfort | Appearence | Noise | Road Quality | Pavement Condition | Skidding Resistance | Traffic interference | Material cost | Service life |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Slurry seal | 0.099 | 0.041 | 0.000 | 0.149 | 0.000 | 0.000 | 0.031 | 0.148 | 0.062 |
| Micro-surfacing | 0.050 | 0.041 | 0.017 | 0.149 | 0.148 | 0.000 | 0.019 | 0.148 | 0.062 |
| Chip seal | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.099 | 0.039 | 0.000 | 0.000 |
| Ultra-thin overlays | 0.099 | 0.041 | 0.017 | 0.000 | 0.296 | 0.149 | 0.000 | 0.148 | 0.062 |

Figure 7. Weighted normalized decision matrix.

According to Equations (16)–(18), calculate the proximity of each solution based on pavement performance. As all pavement performance indicators are positively oriented, the positive ideal solution and negative ideal solution are determined separately. The distance of each solution from the positive ideal solution and negative ideal solution is shown in Figure 8.

<table><tbody><tr><td rowspan="2"></td><td colspan="3">C1: Service function</td><td colspan="3">C2: Pavement performance</td><td colspan="3">C3: Economic effectiveness</td></tr><tr><td>d1+j</td><td>d1-j</td><td>E<sub>1</sub>+<sub>j</sub></td><td>d+2j</td><td>d-2j</td><td>E<sub>2</sub>+<sub>j</sub></td><td>d3+j</td><td>d3-j</td><td>E<sub>3</sub>+<sub>j</sub></td></tr><tr><td>Slurry seal</td><td>0.017</td><td>0.107</td><td>0.863</td><td>0.331</td><td>0.149</td><td>0.310</td><td>0.031</td><td>0.161</td><td>0.839</td></tr><tr><td>Micro-surfacing</td><td>0.049</td><td>0.067</td><td>0.578</td><td>0.210</td><td>0.210</td><td>0.500</td><td>0.019</td><td>0.162</td><td>0.895</td></tr><tr><td>Chip seal</td><td>0.108</td><td>0</td><td>0</td><td>0.335</td><td>0.099</td><td>0.228</td><td>0.165</td><td>0</td><td>0</td></tr><tr><td>NovaChip</td><td>0</td><td>0.108</td><td>1</td><td>0.149</td><td>0.331</td><td>0.690</td><td>0</td><td>0.165</td><td>1</td></tr></tbody></table>

Figure 8. Distance and proximity index of each solution to ideal solution.

Based on the criteria, considering the road service function criteria layer, all indicators corresponding to the service function layer are positive indicators. The proximity indices for the slurry seal, micro-surfacing, chip seal, and ultra-thin overlay are 0.863, 0.578, 0, and 1, respectively. According to the positive and negative judgment criteria, the proximity index of the ultra-thin overlay is closest to 1, determining it as the optimal solution. Considering the usage performance criteria layer, all indicators corresponding to the usage performance layer are positive indicators. The proximity indices for the slurry seal, micro-surfacing, chip seal, and ultra-thin overlays are 0.310, 0.500, 0.228, and 0.690, respectively. According to the positive and negative judgment criteria, the proximity index of the ultra-thin overlay is closest to 1, determining it as the optimal solution. Considering the economic effectiveness criteria layer, where material cost is a negative indicator, the proximity indices for the slurry seal, micro-surfacing, chip seal, and ultra-thin overlays are 0.839, 0.895, 0, and 1, respectively. According to the positive and negative judgment criteria, the proximity index of the ultra-thin overlay is closest to 0, determining it as the optimal solution.

## 4.2. Ranking assessment

The AHP was applied to determine the weights of evaluation criteria at the decisionmaking level for preventive maintenance schemes on ordinary provincial highways. The weights were determined as W = [0.1463, 0.5317, 0.3220]. The judgment matrix constructed from the closeness to the criteria evaluation for each indicator is represented as Equation (21):

$$
E = \begin{bmatrix} 0.863 & 0.578 & 0 & 1 \\ 0.310 & 0.500 & 0.228 & 0.690 \\ 0.839 & 0.895 & 0 & 1 \end{bmatrix}\tag{21}
$$

From Equation (21), the computed comprehensive evaluation result vector is (0.5612, 0.6386, 0.1212, 0.8352). This yields the comprehensive superiority percentages of the four maintenance schemes—slurry seal, micro-surfacing, chip seal, and ultra-thin overlays— as 56.12%, 63.86%, 12.12%, and 83.52%, respectively. Therefore, the priority ranking of the schemes is as follows: ultra-thin overlays > micro-surfacing > slurry seal > chip seal. Thus, in the preventive maintenance of second-class highways, when deciding from the perspectives of service function, pavement performance, and economic effectiveness, ultrathin overlays should be prioritized as the preventive maintenance scheme.

## 5. Conclusions

This study comprehensively evaluated the applicability and priority ranking of pre-ventive maintenance schemes on national and provincial highways, considering factors such as service function, pavement performance, and economic effectiveness. This research innovatively proposes a pavement preventive maintenance prioritization method based on AHP-TOPSIS. The Analytic Hierarchy Process (AHP) is used to determine the weights of various factors (3 criteria and 9 subcriteria) that influence maintenance decision-making. The technique for order of preference by similarity to ideal solution (TOP-SIS) allows quantitative and qualitative assessment of the relative effectiveness of schemes. This approach was applied to a 6 km section of second-class highway in Shangrao City, Jiangxi Province, China, and recommendations are made for the implementation of different preventive maintenance techniques. The following conclusions can be drawn.

Using the AHP method, a comprehensive evaluation system for preventive maintenance scheme decision-making was constructed. Three aspects—service function pavement performance, and economic effectiveness—were identified as influencing factors for maintenance scheme decisions. These factors include driving comfort (X1), appearance (X2), noise (X3), quality index (X4), pavement damage (X5), skid resistance (X6), traffic interference (X7), cost (X8), and service life (X9).

By comparing these factors and establishing a comparison matrix, the weights of these nine criteria influencing the schemes were determined as follows: 0.0948, 0.0179, 0.0336, 0.1849, 0.2873, 0.0595, 0.0536, 0.1074, and 0.1610, respectively. The highest weight was assigned to pavement damage condition, considered the most crucial factor affecting maintenance scheme decisions. Next in importance was the service life of the pavement after maintenance. Relatively less significant factors included road aesthetics, noise, and traffic interference during construction.

Using the TOPSIS method, four common preventive maintenance schemes for national trunk highways in Jiangxi Province—slurry seal, micro-surfacing, chip seal, and ultra-thin overlays—were evaluated. The closeness to the ideal targets for the schemes in terms of service function, pavement performance, and overall benefits was calculated. The closeness values for slurry seal, micro-surfacing, chip seal, and ultra-thin overlays with respect to the three criteria layers were found to be (0.863, 0.310, 0.869), (0.578, 0.500, 0.895), (0, 0.228, 0), and (1, 0.690, 1), respectively. It was observed that ultra-thin overlays exhibited the highest closeness to the ideal targets across the three criteria layers.

Establishing an AHP-TOPSIS comprehensive evaluation model for pavement pre-ventive maintenance schemes, the method was applied to a 6 km long second-class highway of Jiangxi Province. The computed comprehensive superiority percentages for preventive maintenance schemes were 56.12%, 63.86%, 12.12%, and 83.52%, identifying ultra-thin overlays as the recommended preventive maintenance scheme for the example road segment.

This approach comprehensively addresses the issue of weighting factors from different influences, reducing the subjective biases of maintenance managers and the potential errors of decisions based on single factors. It improves the scientific basis for decisions on preventive maintenance schemes. However, further research is needed to improve its practical applicability. Firstly, the suitability of this method should be evaluated for highways of different technical quality and service life. In addition, the current study did not consider the subsequent effects of different maintenance treatments on pavement performance. Future work should investigate the factors that influence the rate of pavement performance deterioration in order to determine optimal preventive maintenance strategies.

**Author Contributions:** Conceptualization, T.L. and D.Y.; methodology, Y.L. and F.G.; formal analysis, J.S.; writing—original draft preparation, Y.L.; writing—review and editing, Y.L. and F.G.; investigation, C.Y. and X.Z.; validation, H.P. All authors have read and agreed to the published version of the manuscript.

**Funding:** This research was funded by the Technology Project of Jiangxi Provincial Department of Transportation (2021H0001), the Technology Project of Shaanxi Provincial Department of Transportation (24-35K), the Shaanxi Transportation Holding Group Technology Development Co., Ltd Scientific Research Project (KY-2024-03), and the Technology Project of Shaanxi Provincial Department of Transportation (23-77R).

**Data Availability Statement:** The original contributions presented in the study are included in the article; further inquiries can be directed to the corresponding author.

**Acknowledgments:** The authors would like to thank the Technology Project of Jiangxi Provincial Department of Transportation.

**Conflicts of Interest:** Author Chun Yu and author Xin Zhao were employed by the company Jiangxi Provincial Highway Engineering Inspection Center and Shaanxi Transportation Planning and Design Institute Co., Ltd respectively. The remaining authors declare that the research was conducted in the absence of any commercial or financial relationships that could be construed as a potential conflict of interest.

## References

1 Ministry of Transport. Statistical Bulletin on Transportation Sector Development, 2023. China Transport News, 18 June 2024, p. 002.

2. Hu, Y.; Si, W.; Kang, X.; Xue, Y.; Wang, H.; Parry, T.; Airey, G.D. State of the art: Multiscale evaluation of bitumen ageing behaviour. Fuel 2022, 326, 125045.

3. Hasan, U.; Whyte, A.; AlJassmi, H. A multi-criteria decision-making framework for sustainable road transport systems: Integrating stakeholder-cost-environment-energy for a highway case study in United Arab Emirates. J. Clean. Prod. 2024, 450, 141831.

4. Wu, W.; Jiang, W.; Xiao, J.; Yuan, D.; Wang, T.; Ling, X. Investigation of LAS-based fatigue evaluation methods for high-viscosity modified asphalt binders with high-content polymers. Constr. Build. Mater. 2024, 422, 135810.

5. Zihao, G. Research on Highway Asphalt Pavement Service Performance Prediction and Preventive Maintenance Decision-Making. Master’s Thesis, Chang’an University: Xi’an, China, 2019.

6. Lei, S. Research on the Performance Detection Evaluation and Maintenance Countermeasures of Highway Asphalt Pavement in Shaanxi Province. Master’s Thesis, Chang’an University: Xi’an, China, 2019.

7. Wu, W.; Cavalli, M.C.; Jiang, W.; Kringos, N. Differing perspectives on the use of high-content SBS polymer-modified bitumen. Constr. Build. Mater. 2024, 411, 134433.

8. Li, J.; Yin, G.; Wang, X.; Yan, W. Automated decision making in highway pavement preventive maintenance based on deep learning. Autom. Constr. 2022, 135, 104111.

9. Li, Z.; Lan, Y.; Lin, W. Footbridge damage detection using smartphone-recorded responses of micromobility and convolutional neural networks. Autom. Constr. 2024, 166, 105587.

10. Zhang, Z.-T.; Gao, W.-H. Effect of different test methods on the disintegration behaviour of soft rock and the evolution model of disintegration breakage under cyclic wetting and drying. Eng. Geol. 2020, 279, 105888.

11. Shan, J.; Jiang, W.; Huang, Y.; Yuan, D.; Liu, Y. Unmanned Aerial Vehicle (UAV)-Based Pavement Image Stitching Without Occlusion, Crack Semantic Segmentation, and Quantification. IEEE Trans. Intell. Transp. Syst. 2024, 1–16, doi: 10.1109/TITS.2024.3424525.

12. Mamlouk, M.S.; Zaniewski, J.P. Pavement preventive maintenance: Description, effectiveness, and treatments. ASTM Spec. Tech. Publ. 1998, 1348, 121–135.

13. JTG/T 5142-01—2021, Technical specification for preventive maintenance of highway asphalt pavement. In Ministry of Transport of the People's Republic of China: China, 2021.

14. Zhan, Y.; Luo, Z.; Lin, X.; Nie, Z.; Deng, Q.; Qiu, Y.; Wang, T. Pavement preventive maintenance decision-making for high antiwear and optimized skid resistance performance. Constr. Build. Mater. 2023, 400, 132757.

15. Chen, W.; Zheng, M. Multi-objective optimization for pavement maintenance and rehabilitation decision-making: A critical review and future directions. Autom. Constr. 2021, 130, 103840.

16. Jiang, W.; Wang, T.; Yuan, D.; Sha, A.; Zhang, S.; Zhang, Y.; Xiao, J.; Xing, C. Available solar resources and photovoltaic system planning strategy for highway. Renew. Sustain. Energy Rev. 2024, 203, 114765.

17. Broniewicz, E.; Ogrodnik, K. Multi-criteria analysis of transport infrastructure projects. Transp. Res. Part. D Transp. Environ. 2020, 83, 102351.

18. Rojas-Zerpa, J.C.; Yusta, J.M. Application of multicriteria decision methods for electric supply planning in rural and remote areas. Renew. Sustain. Energy Rev. 2015, 52, 557–571.

19. Ofosu Gyinaye, L. Application of Geographic Information Systems and Multicriteria Decision Analysis in Selecting Suitable sites for Rural Tourism Development. Master’s Thesis, Aalto University, Espoo, Finland, 2017.

20. Rezaei, J. Best-worst multi-criteria decision-making method. Omega 2015, 53, 49–57.

21. Chu, A.; Kalaba, R.; Spingarn, K. A comparison of two methods for determining the weights of belonging to fuzzy sets. J. Optim. Theory Appl. 1979, 27, 531–538.

22. Chang, C.-L. A modified VIKOR method for multiple criteria analysis. Environ. Monit. Assess. 2010, 168, 339–344.

23. Opricovic, S.; Tzeng, G.-H. Compromise solution by MCDM methods: A comparative analysis of VIKOR and TOPSIS. Eur. J. Oper. Res. 2004, 156, 445-455.

24. Sayadinia, S.; Beheshtinia, M.A. Proposing a new hybrid multi-criteria decision-making approach for road maintenance prioritization. Int. J. Qual. Reliab. Ma 2021, 38, 1661–1679.

25. Nautiyal, A.; Sharma, S. Scientific approach using AHP to prioritize low volume rural roads for pavement maintenance. J. Qual. Maint. Eng. 2022, 28, 411–429.

26. Kresnanto, N.C. Prioritizing District Road Maintenance Using AHP Method. In Proceedings of the Second International Conference of Construction, Infrastructure, and Materials: ICCIM 2021, Jakarta, Indonesia, 26 July 2021; Springer Nature Singapore: Singapore, 2022; pp. 363–371.

27. Ouma, Y.O.; Opudo, J.; Nyambenya, S. Comparison of fuzzy AHP and fuzzy TOPSIS for road pavement maintenance prioritization: Methodological exposition and case study. Adv. Civ. Eng. 2015, 2015, 140189.

28. Ramadhan, R.H.; Al-Abdul Wahhab, H.I.; Duffuaa, S.O. The use of an analytical hierarchy process in pavement maintenance priority ranking. J. Qual. Maint. Eng. 1999, 5, 25–39.

29. Ahmed, S.; Vedagiri, P.; Rao, K.K. Prioritization of pavement maintenance sections using objective based Analytic Hierarchy Process. Int. J. Pavement Res. Technol. 2017, 10, 158–170.

30. Shuai, Q.Y.; He, Y.B. Application of Improved TOPSIS Method to the Evaluation on Asphalt Pavement Performance. App. Mech. Mater. 2013, 253, 611–615.

31. Chang, J.-R.; Chen, D.-H.; Hung, C.-T. Selecting Preventive Maintenance Treatments in Texas: Using the Technique for Order Preference by Similarity to the Ideal Solution for Specific Pavement Study3 Sites. Transp. Res. Rec. 2005, 1933, 62–71.

32. Mathew, M.; Chakrabortty, R.K.; Ryan, M.J. A novel approach integrating AHP and TOPSIS under spherical fuzzy sets for advanced manufacturing system selection. Eng. Appl. Artif. Intell. 2020, 96, 103988.

33. Mangla, S.K.; Kumar, P.; Barua, M.K. Risk analysis in green supply chain using fuzzy AHP approach: A case study. Resour. Conserv. Recycl. 2015, 104, 375–390.

34. Zhang, D.; Hu, J. A novel multi-interval-valued fuzzy set model to solve MADM problems. Expert. Syst. Appl. 2024, 238, 122248.

35. JTG 5210—2018; Highway Performance Assessment Standards; Ministry of Transport of the People's Republic of China: Beijing, China, 2018.

**Disclaimer/Publisher’s Note:** The statements, opinions and data contained in all publications are solely those of the individual author(s) and contributor(s) and not of MDPI and/or the editor(s). MDPI and/or the editor(s) disclaim responsibility for any injury to people or property resulting from any ideas, methods, instructions or products referred to in the content.