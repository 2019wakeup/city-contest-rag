<!--
SOURCE: 原始 PDF: reference/背景知识/2023-Applied Science-Optimization for Asphalt Pavement Maintenance Plans at Network Level Integrating Maintenance Funds, Pavement Performance, Road Users, and Environment.pdf | 页数: 17 | 集合: reference
题录: litfull-003 Optimization for Asphalt Pavement Maintenance Plans at Network Level: Integrating Maintena (DOI: 10.3390/app13158842)
提取: MinerU markdown 全文（可重建索引的真相源副本；images/ 不入 corpus）
-->
Article

# Optimization for Asphalt Pavement Maintenance Plans at Network Level: Integrating Maintenance Funds, Pavement Performance, Road Users, and Environment

**Xinfang Guan** <strong><sup>1</sup></strong>**,\*, Hongchao Zhang** <strong><sup>1</sup></strong>**, Xiaobo Du** <strong><sup>2</sup></strong>**, Xiyu Zhang** <strong><sup>1</sup></strong>**, Mutian Sun** <strong><sup>1</sup></strong> **and Yufeng Bi** <strong><sup>3</sup></strong>

The Key Laboratory of Road and Traffic Engineering, Ministry of Education, Tongji University, 4800 Cao’an Road, Shanghai 201804, China

2 Postdoctoral Station of Mechanical Engineering, Tongji University, Shanghai 201804, China

3 Shandong Provincial Communications Planning and Design Institute, Jinan 250101, China

\* Correspondence: 1910955@tongji.edu.cn

![](images/page_0_image_9.jpg)

**Citation:** Guan, X.; Zhang, H.; Du, X.; Zhang, X.; Sun, M.; Bi, Y. Optimization for Asphalt Pavement Maintenance Plans at Network Level: Integrating Maintenance Funds, Pavement Performance, Road Users, and Environment. Appl. Sci. **2023**, 13, 8842. [https://doi.org/10.3390/app13158842](https://doi.org/10.3390/app13158842)

Academic Editor: Luís Picado Santos

Received: 14 June 2023 Revised: 28 July 2023 Accepted: 29 July 2023 Published: 31 July 2023

![](images/page_0_image_13.jpg)

**Copyright:** © 2023 by the authors. Licensee MDPI, Basel, Switzerland. This article is an open access article distributed under the terms and conditions of the Creative Commons Attribution (CC BY) license ([https://creativecommons.org/licenses/by/](https://creativecommons.org/licenses/by/4.0/)4.0/).

**Abstract:** As an infrastructure project, the cost and benefits of road maintenance should be measured through social costs. In order to fully consider user interests and make road maintenance decisions more reasonable, two types of user costs that may affect road maintenance benefits have been quantified through analysis of existing literature. At the same time, environmental issues have gradually become the focus of various industries, and in optimizing road maintenance decisions, the impact of environmental issues on decision making should also be considered. This article first analyzes and quantifies the user costs that affect the effectiveness of road maintenance. Secondly, based on the concept of sustainable development of roads, the optimization of road maintenance decisions is divided into two steps: the first step is to determine the minimum maintenance budget funds, and the second step is to determine the optimal plan. The specific optimization method is to use the 0-1 mathematical programming method to establish a network-level pavement maintenance decision optimization model based on a quantitative model. The most reasonable maintenance optimization plan is determined from four aspects: maintenance funds, maintenance performance improvement value, user benefit improvement, and reducing environmental impact. Finally, a provincial road network for a case study is selected. The applicability of the new model is verified through a case study. This study can help decision makers deal with asphalt pavement maintenance arrangements at the network level with four decision objectives: maintenance funds, pavement performance, road users, and environmental impacts.

**Keywords:** network-level optimization method; user costs; environment costs; performance improvement

## 1. Introduction

Since its reform and opening up, China has made tremendous achievements in highway construction. According to the Statistical Bulletin on the Development of the Transportation Industry, the development process of high-speed highways in China in recent years is shown in Figure 1.

With the continuous development of the highway industry, under the combined effects of traffic loads and natural environmental factors, the road surface has experienced varying degrees of diseases, and the performance of the road surface has also declined. The maintenance task of the road surface is also becoming increasingly heavy. The focus of China’s highway work has gradually shifted from construction to maintenance and management. On the basis of such a large road network scale, facing such a large number of road mileage, effectively managing, improving the efficiency of maintenance fund utilization, and ensuring the level of road service have become important tasks for China’s highway maintenance and management department.

![](images/page_1_chart_2.jpg)

Figure 1. National expressway mileage.Figure 1. National expressway mileage.

With the continuous development of the highway industry, under the combined ef-Unlike project-level road maintenance decisions that aim to maximize the benefits of fects of traffic loads and natural environmental factors, the road surface has experiencedspecific road sections, network-level decision optimization generally focuses on a certain varying degrees of diseases, and the performance of the road surface has also declined.scale of the road network as the research object. Under budget and other resource con-The maintenance task of the road surface is also becoming increasingly heavy. The focusstraints, it seeks the optimal combination of maintenance strategies and fund allocation of China’s highway work has gradually shifted from construction to maintenance andschemes to maximize the benefits objectives (such as road performance); alternatively, management. On the basis of such a large road network scale, facing such a large numberunder certain pavement performance requirements and resource constraints, seeking the of road mileage, effectively managing, improving the efficiency of maintenance fund uti-optimal maintenance strategy to minimize cost objectives (maintenance costs, user costs, lization, and ensuring the level of road service have become important tasks for China’setc.) [1]. With the rapid growth of China’s highway pavement maintenance scale, the conhighway maintenance and management department.tradiction between limited maintenance funds and huge maintenance mileage has become Unlike project-level road maintenance decisions that aim to maximize the benefits ofmore prominent. How to reasonably allocate funds for each section of the road network specific road sections, network-level decision optimization generally focuses on a certainhas become more difficult. Meanwhile, due to the long-term period of reconstruction and scale of the road network as the research object. Under budget and other resource con-light maintenance, the investment in maintenance funds is relatively small. The occurrence straints, it seeks the optimal combination of maintenance strategies and fund allocationof road surface diseases mostly relies on the experience of on-site construction personnel. schemes to maximize the benefits objectives (such as road performance); alternatively, un-However, due to a lack of maintenance funds and unscientific maintenance decisions, some der certain pavement performance requirements and resource constraints, seeking the op-road sections that require maintenance have not received timely maintenance and repair, ti l i t t t t i i i t b ti ( iresulting in accelerated degradation of road performance [2].

Wi h h id h f Chi ’ hi h  i l , hCurrently, the main decision-making methods for network-level pavement maintedi ti b t li it d i t f d d h i t il h bnance are the sorting method and the optimization method. In the research of pavement maintenance decision making based on the sorting method, most scholars construct project h b  d ffi l . h l , d  h l - d f  dor road section value functions by comprehensively considering various factors that affect decision making, or use methods such as the Analytic Hierarchy Process, Cluster Analy sis, Matter Element Model, and Benefit Cost Analysis to rank the importance of projects and select projects based on priority [3–5]. However, decision-making methods based on priority ranking often provide the sum of a set of project decisions, and decision makers cannot consider trade-offs between projects when selecting projects. Optimization rules can simultaneously consider the maintenance plan and maintenance time of each section of the road network to obtain a better maintenance plan. Many achievements have been made in the research of pavement maintenance decision making based on the optimization method,at home and abroad. Zhang et al. [6] established a multi-objective optimization model of pavement maintenance based on Dynamic programming with the objective of minimizing,         ,the cost of pavement maintenance and greenhouse gas emissions as the optimization goal;,   ,Elhaddy et al. [7] established a multi-objective pavement maintenance optimization model. ,based on a genetic algorithm with the goal of minimizing maintenance costs and maximizp g  p       p , ing pavement performance; Bryce et al. [8] proposed a multi-objective optimization-based road maintenance analysis and decision-making method, and used this method to balance maintenance costs, road conditions, and energy consumption; Peng et al. [1] proposed a project two-layer network-level pavement maintenance decision-making optimization model consisting of a multiyear fund allocation model and a project selection model with the goal of maintenance efficiency; Xie [9] established a multi-objective decision model for pavement maintenance with the minimum maintenance cost and maximum maintenance benefit as the maintenance goal under the financial constraints; Mao [10] constructed a two-layer optimization model for network-level road surface decision making, with the maximum sum of vehicle travel cost savings and traffic revenue increase, and the minimum generalized cost of vehicle travel as the upper and lower objectives, respectively; Feng [2] established a multi-objective network-level pavement maintenance decision optimization model under both deterministic and uncertain conditions, with the goal of achieving the average pavement performance and the percentage of road length that meets a certain pavement performance index threshold. In summary, existing research mostly establishes decision optimization models from the perspective of operating units, with objective functions mostly targeting maintenance costs, road network performance, investment benefit ratio, etc., and less considering optimization of user costs and the environmental impact of maintenance. There is a lack of comprehensive consideration of maintenance costs, road network performance, user costs, and the environmental impact of maintenance.

In summary, based on the review of the existing literature, this article first analyzes and quantifies the user costs that affect the effectiveness of road maintenance. Secondly, through the concept of sustainable development of roads, the optimization of road maintenance decision making is divided into two steps: the first step is to determine the minimum maintenance budget funds, and the second step is to determine the optimal plan. The specific optimization method adopts the 0-1 mathematical programming method, establishes a network-level pavement maintenance decision optimization model based on a quantitative model, and identifies the most reasonable maintenance optimization plan among the four aspects of maintenance funds, maintenance performance improvement value, user benefit improvement, and environmental impact reduction. Finally, a road network in a province is selected for the case study. This study can help decision makers consider the diversity of practical problems from the perspectives of managers, users, and the environment, and make road maintenance decisions from a more reasonable perspective as China is about to enter a new era of “focusing on maintenance”.

## 2. Theoretical Basis

## 2.1. Performance Evaluation Indicators for Asphalt Pavement

According to the Highway Technology Evaluation Standard [11], the evaluation indicators for road surface technical conditions are mainly divided into two categories: single indicators and comprehensive indicators. Among them, single indicators include road surface damage, smoothness, skid resistance, and structural strength. The comprehensive evaluation indicators are established on the basis of each single evaluation indicator and are calculated by assigning a certain weight to each indicator and adding them together. The relationship between various pavement performance indicators and evaluation indicators is analyzed, as shown in Figure 2.

According to Figure 2, the specific evaluation indicators for each individual indicator are PCI (pavement damage), RQI (smoothness), PSSI (structural strength), and SRI (slip resistance coefficient). To comprehensively reflect the relationship between pavement performance and each individual indicator, the pavement performance index PQI is used to comprehensively evaluate pavement performance. The sum of the weighted values of each individual indicator is used as the result of the pavement performance index PQI, and the specific calculation formula is as follows [12].

$$
P Q I = w _ { P C I } P C I + w _ { R Q I } R Q I + w _ { S R I } S R I + w _ { P S S I } P S S I\tag{1}
$$

The weight w of each indicator is not fixed, depending on the actual road conditions and different maintenance strategies. This can be appropriately adjusted within the scope of recommendation given in technical specifications, but four parameters of 0.35, 0.35, 0.1,The relationship between various pavement performance indicators and evaluation indiand 0.2, respectively, are generally recommended.cators is analyzed, as shown in Figure 2.

![](images/page_3_image_3.jpg)

.  p p    g .Figure 2. Current pavement performance index evaluation system diagram.

## According to Figure 2, the specifi1 Pavement condition index (PCI)

The damage condition of the pavement structure reflects the degree to which the pavement structure remains intact or intact under the influence of driving and natural factors. The pavement condition index reflects the structural performance of the road surface. In the current “Highway Technical Condition Evaluation Standard” (JTG H20-2007), the pavement damage condition index PCI is used to represent it, and the calculation formula is [13]:

$$
P C I = 1 0 0 - \sum _ { i = 1 } ^ { n } \sum _ { j = 1 } ^ { m _ { i } } D P _ { i j } W _ { i j }\tag{2}
$$

tions awhere

$i , j _ { 1 }$ pe of recommendation given in technical specifications, but—counters for distress types and severity levels, respectively;

0.35, 0.1, and 0.2, respectively, are generally recn—the total number of observed distress types;

$m _ { i } -$ Pavement condition index (PCI)—the number of severity levels for the distress type i;

$D P _ { i j }$ —the deducted value that varies with distress type i and severity j;

$W _ { i j } \mathrm { {  —  } a n }$ adjustment weight when the pavement with distress type i reaches the severity level m.

## fac2 In the current “HighwayRide quality index (RQI)

g       p ,Driving comfort is the most direct reflection of road service level and also the subjective mula is [13]:feeling of road users towards the public service level. The driving comfort index is one of the important evaluation indicators for road maintenance quality, which is mainly affected (2)by road smoothness. The current “Highway Performance Evaluation Standard“ (JTG H20-2007) [11] uses the ride quality index (RQI) for evaluation, and the international roughness index (IRI) is measured using a continuous roughness meter. The ride quality index is calculated according to Formula (3):

$$
R Q I = \frac { 1 0 0 } { 1 + a _ { 0 } e ^ { \left( a _ { 1 } \cdot I R I \right) } }\tag{3}
$$

where $a _ { 0 } , a _ { 1 1 }$ —model parameters, using 0.026 and 0.65, respectively.

## lev3 𝑚.Skid resistance index (SRI)

Ride quality index (RQI)Anti-slip performance is one of the important indicators reflecting road safety per-Driving comfort is the most direct reflection of road service level and also the subjec-formance. At high speeds, the decrease in anti-slip performance leads to a decrease in the braking capacity of the car, resulting in accidents. Anti-slip performance is adopted based on the lateral force coefficient (SFC) for evaluation, and is calculated according to Equation (4):

$$
SRI = \frac{100 - SR\mathrm{I}_{\min}}{1 + a_{0}e^{(a_{1} \cdot SFC)}} + SR\mathrm{I}_{\min}\tag{4}
$$

where $S R I _ { \mathrm { m i n } }$ —calibrate parameters using 35.0.

$a_{0},a_{1}  — ]$ model parameters, using 28.6 and −0.105, respectively.

## 4 Pavement structure strength index (PSSI)

The bearing capacity of a pavement structure refers to the number of vehicle loads it can withstand in the event of damage to the pavement. It can be used to determine the remaining lifespan of the road surface. The pavement structure strength index (PSSI) for pavement structure strength evaluation is calculated according to Equation (5):

$$
PSSI = \frac{100}{\begin{matrix} 1 + 15.71e^{-5.19SSI} \\  SSI  = l_{d}/l_{0} \end{matrix}}\tag{5}
$$

where

SSI—strength coefficient of pavement structure, which is the ratio of the designed deflection value of the pavement to the measured representative deflection value;

$l _ { d } .$ —pavement design deflection (mm);

$l _ { 0 } \cdot$ —measured representative deflection (mm);

$a _ { 0 } , a _ { 1 }$ —model parameters, using 15.71 and −5.19, respectively.

## 2.2. Optimization of Pavement Performance Evaluation Method

The evaluation of road performance includes multiple indicators such as RQI, PSSI, PCI, and SRI and is a comprehensive evaluation system. The PQI can reflect the comprehensive maintenance situation of the road, but when making specific maintenance plans, it is necessary to consider the performance advantages and disadvantages of each individual item. Therefore, using the PQI alone to develop specific maintenance measures is not very targeted. This requires combining several individual indicators of pavement performance for analysis, which leads to a new concept—the combined state of pavement performance, which is graded and conducive to the optimization of maintenance decisions in the future.

The current regulations in our country classify four indicators, including the RQI, PCI, SRI, and PSSI, into five levels: excellent, good, medium, secondary, and poor. Based on the combination of pavement performance states mentioned above, there are $5 ^ { 4 } { = } 6 2 5$ combination states of pavement performance, each with different maintenance measures, resulting in thousands of possible situations. The scale of decision-making optimization is too large, which is not conducive to solving. Therefore, it is necessary to analyze and study the combination state of road performance, reduce unnecessary combination states, and reduce the decision-making scale. After analyzing the specific state combinations and relevant technical specifications of highways in China, the simplified pavement performance state combinations currently used are shown in Table 1:

Table 1. Simplified combination of the pavement performance conditions.

<table><tr><td colspan="4">Verbal Rating (Numerical Rating)</td></tr><tr><td>PCI</td><td>Good [70–100]</td><td>Fair [55–70)</td><td>Poor [0–55)</td></tr><tr><td>RQI</td><td>Good [80–100]</td><td>Fair [62–80)</td><td>Poor [0–62)</td></tr><tr><td>SRI</td><td>Sufficient [62–100]</td><td>Insufficient [0–62)</td><td></td></tr><tr><td>PSSI</td><td>Sufficient [80–100]</td><td>Insufficient [0–80)</td><td></td></tr></table>

After simplification, there are a total of 36 levels and combinations, effectively reducing the size of the combination state and achieving the goal of simplifying decision making.

In order to facilitate game analysis of combination states, we introduce the decision tree method for auxiliary decision analysis. Among the four indicators of the RQI, PSSI, PCI, and SRI, the PSSI holds the most important position. If the structural strength does not meet the requirements, it is necessary to forcibly adopt major repair and reinforcement measures to repair the road surface. The road surface anti-slip index SRI has the second priority, and when the road surface meets the structural strength, we need to consider whether the anti-slip performance of the road surface meets the requirements. The RQI ranks third in priority, and only when both structural and anti-slip performance is met can the impact of the RQI be considered, while the PCI has the lowest priority. In terms of maintenance measures, we divide them into five categories: routine maintenance, paving of the overlay, paving of the anti-skid layer, paving reconstruction, and structural reinforcement. Table 2 shows the maintenance strategies for each combination of conditions. As can be seen in Table 2, only 11 condition combinations are of practical significance for the pavement performance for the maintenance decision optimization problem.

Table 2. Condition combination of the expressway asphalt pavement performance.

| Combination | PCI | RQI | SRI | PSSI |
| --- | --- | --- | --- | --- |
| 1 | Good | Good | Sufficient | Sufficient |
| 2 | Fair | Good | Sufficient | Sufficient |
| 3 | Poor | Good | Sufficient | Sufficient |
| 4 | Good | Fair | Sufficient | Sufficient |
| 5 | Fair | Fair | Sufficient | Sufficient |
| 6 | Poor | Fair | Sufficient | Sufficient |
| 7 | Good | Poor | Sufficient | Sufficient |
| 8 | Fair | Poor | Sufficient | Sufficient |
| 9 | Poor | Poor | Sufficient | Sufficient |
| 10 |  |  | Insufficient | sufficient |
| 11 |  |  |  | Insufficient |

## 2.3. Estimating User Costs

When making network-level road maintenance decisions, the road maintenance management department always tends to choose low-cost and cost-effective maintenance plans [14]. The National Association of Highways and Transportation Officials (AASHO) defines road maintenance benefits as reducing user-related travel costs through road maintenance, which mainly includes reducing vehicle travel costs and reducing vehicle travel time costs [15], Domestic and foreign scholars’ relevant research also mainly considers these two aspects [4,16,17], and it can be seen that the cost of vehicle travel time and vehicle travel cost have a significant impact on the efficiency of road maintenance. Based on this, this article takes providing convenient and comfortable services to users as the starting point and determines the user costs that affect the efficiency of road maintenance as the cost of vehicle travel time and vehicle travel cost.

## 2.3.1. Cost Savings in User Travel Time

The user travel time cost is the value that arises due to the existence of an opportunity cost of the time consumed by the vehicle during the trip [18,19]. The savings in user travel time cost after implementing pavement maintenance $\Delta T$ can be expressed by Equation [10]:

$$
\Delta T = \theta \cdot Q \cdot \left( T _ { 0 } - T _ { 1 } \right)\tag{6}
$$

## where

θ—the time value coefficient, usually related to the personal income of regional travelers [20].

Q—the traffic volume of the road section((pcu/d)).

$T _ { 0 ^ { \circ } }$ —the travel time of a single vehicle before maintenance.

$T _ { 1 }$ —the travel time of a single vehicle after maintenance.

The calculation of Equation (6) requires a functional relationship between the user travel time of the road section and the pavement condition. The PCI is then adopted as an indicator of the pavement condition. The functional relationship between v and the PCI can be obtained through tests on a large number of road sections, which is expressed as follows:

$$
T = \frac{l}{v} = \frac{l}{0.82PCI + 16.5}\tag{7}
$$

where l is the section distance (km), v is the vehicle speed (km/h).

Therefore, the savings in user travel time costs after the pavement maintenance can be represented as follows:

$$
\Delta T = Q \cdot \theta \cdot \big( \frac{l}{v_0} - \frac{l}{v_1} \big) = Q \cdot \theta \cdot \big( \frac{l}{0.76PCI_0 + 0.35} - \frac{l}{0.76PCI_1 + 0.35} \big)\tag{8}
$$

where $P C I _ { 0 }$ represents the PCI value of the road before maintenance and $P C I _ { 1 }$ represents the PCI value of the road after maintenance.

## 2.3.2. Cost Savings in Vehicle Travel Fuel Consumption

Fuel consumption cost refers to energy expenses consumed by the vehicle in the travel process [13,21–23]. According to [24], for a minivan, which is selected as the standard vehicle in this study, the relationship between the fuel consumption, the vehicle speed, and the IRI can be expressed by the following equation:

$$
O = - 0 . 2 2 \times V + 0 . 0 0 1 3 \times V ^ { 2 } + 0 . 2 5 \times I R I + 1 5 . 3 7\tag{9}
$$

where $O$ is the fuel consumption $\mathrm { L } / 1 0 0$ km and $\mathrm { V }$ is the vehicle speed. When assuming that the vehicle is traveling at a speed of 80 km $/ \mathrm { h } ,$ the relationship between the fuel consumption and the IRI can be described by the following equation:

$$
O = 0 . 2 5 \cdot I R I + 1 5 . 3 7\tag{10}
$$

Based on Equation (10), the cost savings in fuel consumption after pavement maintenance can be expressed as

$$
\Delta O = 0 . 2 5 \cdot g \cdot \left( I R I _ { 0 } - I R I _ { 1 } \right) \cdot l \cdot Q\tag{11}
$$

where

$g -$ —the fuel price,

$I R I _ { 0 }$ —the IRI value of the road before maintenance $( \mathrm { m } / \mathrm { k m } )$

$I R I _ { 1 }$ —the IRI value of the road after maintenance $( \mathrm { m } / \mathrm { k m } )$

## 3. Development of Network-Level Pavement Maintenance Optimization Model

## 3.1. Basic Hypotheses

To simplify the problem, this article makes the following assumptions when establishing the model:

1 There is no significant change in traffic volume before and after the implementation of maintenance on the road section.

2 Do not consider the impact on users during road closure or semi-closure caused by road maintenance construction.

3 The implementation of the same maintenance measures by each construction unit has the same impact on improving road performance.

4 Only one maintenance measure will be implemented for each section during the analysis period.

5 Based on the literature research and analysis [25], the improvement effects of five maintenance measures on the road surface are obtained, as follows:

a. Routine maintenance cannot improve the level of pavement performance evaluation indicators;

b. Increase the RQI of the paving of the overlay by one level and PCI by two levels;

c. Paving of the anti-skid layer to restore the SRI to the optimal level;

d. Restoration of the RQI and PCI to optimal levels during paving reconstruction;

e. All indicators of paving reconstruction and structural reinforcement have been restored to the optimal level.

## 3.2. Development of the Optimization Model

## 3.2.1. Determining the Minimum Maintenance Budget Funds

In the whole life cycle of a road, we must keep the road performance and service level in a sustainable premise so that the road can provide better service throughout its life cycle. So, we will consider the entire life cycle of the road. The road performance and service level will not decline throughout the life of the road, that is, the decision makers of this year’s road maintenance funds for the budget must refer to the previous year’s road performance and service level so that this year’s maintenance goals are not lower than the value of the same period last year in order to determine the Minimum Budget Funds B.

The problem of minimum maintenance budget funding can be described as:

$$
\begin{array} { r } { M i n B _ { t } = \sum _ { i = 1 } ^ { n } \sum _ { k = 1 } ^ { 1 1 } \sum _ { j = 1 } ^ { 5 } a _ { i , k , j } L _ { i } D _ { i , k } b _ { i , j } } \end{array}\tag{12}
$$

The constrains are as follows:

$$
\begin{array}{c}\sum_{j = 1}^{5}a_{i,j,k} \leq 1,i = 1,2,\cdots n;k = 1,2,\cdots 11; \\\sum_{i = 1}^{n}\sum_{k = 1}^{11}\sum_{j = 1}^{5}a_{i,k,j}L_{i}D_{i,k}C_{k,j} \geq Z_{t} - Z_{t - 1} \\a_{i,10,1} = a_{i,10,2} = a_{i,10,4} = a_{i,10,5} = 0,a_{i,10,3} = 1 \\a_{i,11,1} = a_{i,11,2} = a_{i,11,3} = a_{i,10,4} = 0,a_{i,11,5} = 1 \\a_{i,k,j} = \left\{ 0,1 \right\}\end{array}\tag{13}
$$

where:

$B _ { t 1 }$ —the value of the decision objective function, indicating the budgeted funds for road maintenance in year t.

$a _ { i , k , j }$ —the main decision variable, indicating that if the i-th road is in the k-th combination state of the road section using the j-th maintenance measure, $a _ { i , k , j } = 1$ , otherwise $a _ { i , k , j } = 0 ,$ $( i = 1 , 2 , . . . , n ; k = 1 , 2 , . . . , 1 1 ; j = 1 , 2 , 3 , 4 , 5 )$

$L _ { i } \cdot$ —the total mileage of the i-th road in the road network (km).

$D _ { i , k }$ —the proportion of the i-th road in the road network that is in the k-th road performance combination state.

$b _ { i , j }$ —the cost per kilometer of the i-th road in the road network to take the j-th maintenance measure (million CNY/km).

$C _ { k , j ^ { - } }$ —the value of the road performance improvement if the j-th maintenance measure is applied when the road is in the k-th road performance combination state.

$Z _ { t } -$ the PQI value of pavement in year t.

## 3.2.2. Determine the Optimal Solution

The purpose of optimizing road maintenance decisions before was to achieve the best road performance under certain financial conditions, with less consideration given to the improvement of user comfort and the environmental climate caused by maintenance and repair. Therefore, this article selects performance benefit indicators, user benefit indicators, and environmental benefit indicators for maintenance benefit evaluation.

Based on the various asphalt pavement maintenance benefit evaluation indicators mentioned above, the AHP model is applied to determine the weight coefficients of each indicator and a highway asphalt pavement maintenance benefit evaluation system is established.

The establishment of a model using AHP is generally divided into the following steps:

## 1 Hierarchy Model

AHP reflects the hierarchical relationship of the model through the established hierarchical structure model. Figure 3 shows the AHP hierarchical structure model for evaluating maintenance benefits.

![](images/page_8_image_5.jpg)

Figure 3. AHP maintenance benefit evaluation hierarchy model.Figure 3. AHP maintenance benefit evaluation hierarchy model.

## ②2 Con tru tin a ud ment matrixConstructing a judgment matrix

The construction of a judgment matrix first requires a clear scaling method for theThe construction of a judgment matrix first requires a clear scaling method for the importance of each element in the judgment matrix. At present, the commonly used judg-importance of each element in the judgment matrix. At present, the commonly used judgment matrix scaling method is the 1–9 ratio scaling method, and the specific quantitativement matrix scaling method is the 1–9 ratio scaling method, and the specific quantitative judgment indicators are shown in Table 3.judgment indicators are shown in Table 3.

Table 3. Definition of judgment index scale.Table 3. Definition of judgment index scale.

| Scale | Definition |
| --- | --- |
| 1 | Factor i is equally important as factor j |
| 35 | Factor i is slightly more important than factor j |
|  | Factor i is stronger and more important than factor j |
| 7 | Factor i is more important than factor j |
| 9 | Factor i and factor j are absolutely important |
| 2,4, 6,8 | Judgment value between adjacent degrees |
| Count backwards | The comparison between factor j and factor i shows a reciprocal relationship of 7 with the comparison between factor i and factor j |

## a. Criterion layer judgment matrix

i b fit , i l b fit , d i t l b fit . Th d t t iIn the construction of the judgment matrix of the criterion layer, it is mainly divided f th it i l i h i T bl 4into economic benefits, social benefits, and environmental benefits. The judgment matrix of the criterion layer is shown in Table 4:

Table 4. Judgment matrix of criterion layer.

| Maintenance Benefits | Performance Benefits | User Benefits | Environmental Benefit |
| --- | --- | --- | --- |
| Performance benefits | 1 | 2 |  |
| User benefits | 1/2 |  | 211 |
| Environmental benefit | 1/2 | 11 |  |

## .   g b. Indicator layer judgment matrix

In the construction of the indicator layer judgment matrix, the economic benefit indicator adopts the performance improvement value. The user benefit indicators adopt cost savings in vehicle operation and cost savings in vehicle travel time. The environmental benefit indicators adopt the cost savings of energy consumption and greenhouse gas emissions, and the judgment matrix of the indicator layer is constructed as shown in Tables 5 and 6.

Table 5. Judgment matrix of user benefits.

| User Benefit Indicators | Cost Savings in Vehicle Travel Time | Vehicle Fuel Consumption Cost Savings |
| --- | --- | --- |
| Cost savings in vehicle travel time | 1 | 4 |
| Vehicle fuel consumption cost savings | 1/4 | 1 |

Table 6. Judgment matrix of environmental benefits.

| Environmental Benefit Indicators | Conservation Measures for Greenhouse Gas Emissions Savings | Energy Consumption Savings of Maintenance Measures |
| --- | --- | --- |
| Conservation measures for greenhouse gas emissions savings | 1 | 2 |
| Energy consumption savings of maintenance measures | 1/2 | 1 |

## 3 Model weight calculation results

The eigenvectors calculated based on the above judgment matrix are the corresponding weights of the model. The weight coefficients of each layer in the comprehensive benefit calculation model are shown in Table 7.

Table 7. Model weight coefficient.

<table><tr><td>Hierarchical Structure</td><td>Criterion Layer</td><td>Indicator Layer</td><td>Weighted Results</td></tr><tr><td rowspan="4">Weight coefficient</td><td> $w _ { \mathrm { P e r f o r m a n c e } } ^ { \mathrm { C r i t e r i o n } } = 0 . 5 0 0$ </td><td> $w _ { A } ^ { \mathrm { I n d i c a t o r } } = 1$ </td><td>0.5</td></tr><tr><td> $w _ { U s e r } ^ { \mathrm { C r i t e r i o n } } = 0 . 2 5 0$ </td><td> $w _ { t i m e } ^ { \mathrm { I n d i c a t o r } } = 0 . 8$   $w _ { f u e l } ^ { \mathrm { f r i c i a t o r } } = 0 . 2$ </td><td>0.2 0.05</td></tr><tr><td> $w _ { E n v i r o n m e n t } ^ { \mathrm { C r i t e r i o n } } = 0 . 2 5 0$ </td><td> $w _ { e m i s s i o n } ^ { \mathrm { I n d i c a t o r } } = 0 . 6 7$ </td><td>0.1675</td></tr><tr><td></td><td> $w _ { e n e r g y } ^ { \mathrm { \widehat { I n d i c a t o r } } } = 0 . 3 3$ </td><td>0.0825</td></tr></table>

## 4 Determination of the optimal solution problem

According to the above calculation results, the optimal decision model proposed in this paper is as follows:

$$
MaxZ = \frac{\sum_{i=1}^{n} \sum_{k=1}^{11} \sum_{j=1}^{5} a_{i,k,j} \Big(0.2 \times \Delta {T_{i,k,j}}' + 0.05 \times \Delta {O_{i,k,j}}'\Big)}{\sum_{i=1}^{n} \sum_{k=1}^{11} \sum_{j=1}^{5} a_{i,k,j} L_{i} {D_{i,k}} \Big(0.0825 \times {E_{i,j}}' + 0.1675 \times {G_{i,j}}'\Big)} + \sum_{i=1}^{n} \sum_{k=1}^{11} \sum_{j=1}^{5} 0.5 \times a_{i,k,j} L_{i} {D_{i,k}} {C_{k,j}}'\tag{14}
$$

The constrains are as follows:

$$
\begin{array}{c}\sum_{j = 1}^{5}a_{i,j,k} \leq 1,i = 1,2,\cdots n;k = 1,2,\cdots 11; \\\sum_{i = 1}^{n}\sum_{k = 1}^{11}\sum_{j = 1}^{5}a_{i,k,j}L_{i}D_{i,k}b_{i,j} \leq B_{t} \\a_{i,10,1} = a_{i,10,2} = a_{i,10,4} = a_{i,10,5} = 0,a_{i,10,3} = 1 \\a_{i,11,1} = a_{i,11,2} = a_{i,11,3} = a_{i,10,4} = 0,a_{i,11,5} = 1 \\a_{i,k,j} = \left\{ 0,1 \right\}\end{array}\tag{15}
$$

where

$B _ { t } , \; a _ { i , k , j } , \; L _ { i } , \; D _ { i , k } , \; C _ { k , j } ,$ and variable $b _ { i , j }$ have the same meaning as in the equation for minimum funding determination.

$E _ { i , j }$ — the cost of energy consumption per kilometer for the j-th maintenance measure for the i-th road (million CNY/km).

$G _ { i , j } .$ —the cost of greenhouse gas emissions per kilometer for the j-th maintenance measure for the i-th road (million CNY/km).

$\Delta T _ { i , k , j }$ —the cost of user travel time saved by applying the j-th maintenance measure when the i-th road is in the k-th road performance combination.

$\Delta O _ { i , k , j } .$ —the cost of user travel fuel saved by applying the j-th maintenance measure when the i-th road is in the k-th road performance combination.

Other parameters are consistent with the above model.

Referring to Section 2.3, $\Delta T _ { i , k , j } ,   \Delta O _ { i , k , j }$ can be determined by following equations:

$$
\Delta T _ { i , k , j } = \theta \cdot \mathsf { Q } _ { i } \cdot \Delta t _ { i , k , j }\tag{16}
$$

$$
\Delta O _ { i , k , j } = \mathbb { Q } _ { i } \cdot \Delta o _ { i , k , j }\tag{17}
$$

where

$Q _ { i }$ —the traffic volume of i-th road section

$\Delta t _ { i , k , j }$ the saved user travel time from each vehicle after applying the j-th maintenance strategy for the i-th road section under the k-th combination condition

$\Delta o _ { i , k , j } -$ the saved fuel consumption from each vehicle after applying the j-th maintenance strategy for the i-th road section under the k-th combination condition

$\Delta t _ { i , k , j }$ and $\Delta o _ { i , k , j } \mathtt { c a n }$ be obtained through

$$
\Delta t _ { i , k , j } = L _ { i } \cdot D _ { i , k } \cdot t _ { k , j }\tag{18}
$$

$$
\Delta o _ { i , k , j } = L _ { i } \cdot D _ { i , k } \cdot g \cdot o _ { k , j }\tag{19}
$$

where

$t _ { k , j }$ and $\rho _ { k , j } -$ —the saved user travel time and saved fuel consumption from each vehicle after applying the j-th maintenance strategy for the k-th combination condition in kilometers, respectively.

By adopting Equations (8) and (11), $t _ { k , j }$ and $o _ { k , j }$ can be determined with following equations:

$$
t_{k,j} = \frac{1}{0.82PCI_{0} + 16.5} - \frac{1}{0.82PCI_{1} + 16.5} \atop o_{k,j} = 0.24808( IRI _{0} -  IRI _{1} )\tag{20}
$$

where

$P C I _ { 1 } -$ the pavement condition index of the road under the k-th combination condition after applying the j-th maintenance strategy,

$P C I _ { 0 }$ the pavement condition index of the road under the k-th combination condition before applying the k-th maintenance strategy,

$I R I _ { 1 1 }$ —the international roughness index of the road under the k-th combination condition after applying the j-th maintenance strategy

$I R I _ { 0 }$ —the international roughness index of the road under the k-th combination condition before applying the j-th maintenance strategy.

For Equation (13), in order to eliminate the impact of differences in dimensions and value ranges between different indicators, the original data needs to be dimensionalized to solve the comparability between data indicators. The purpose of maximizing is to use the maximum value as a reference standard, dividing all data by the maximum value. The calculation formula is X/Max, which means taking the maximum value as the unit and removing all data to the maximum value.

$$
\Delta T _ { i , k , j } ^ { \mathrm { ~ \bar { ~ } ~ } } ,   \Delta O _ { i , k , j } ^ { \prime } ,   E _ { i , j } ^ { \prime } ,   G _ { i , j } ^ { \prime } ,   C _ { i , j } ^ { \prime } \mathrm { {  — o r i g i n a l ~ d a t a ~ d i m e n s i o n a l i z e d ~ v a l u e } } .
$$

## 3.3. Case Study

## 3.3.1. Expressway Condition

Select the following nine expressways in a certain province of China’s highway network as the research objects, and apply the model developed in this study to optimize maintenance plan decision making. The specific high-speed situation and mileage are shown in Table 8:

Table 8. Information on mileage and traffic volume of the expressway in the road network.

| Road Number | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Mileage (km) | 208 | 74 | 153 | 214 | 145 | 87 | 41 | 107 | 88 |
| Daily traffic volume | 30,000 | 20,000 | 16,000 | 14,000 | 13,000 | 18,000 | 11,000 | 15,000 | 12,000 |

According to statistics, the distribution of pavement combination status of the above nine expressways at the beginning of the year is obtained, as shown in the Table 9 below:

Table 9. Distributions of different expressway pavement condition combinations in the road network.

<table><tbody><tr><td rowspan="2">Combination</td><td colspan="9">Road Number</td></tr><tr><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td></tr><tr><td>1</td><td>0.92</td><td>0.56</td><td>1</td><td>1</td><td>0.88</td><td>0.81</td><td>0.9</td><td>0.67</td><td>0.81</td></tr><tr><td>2</td><td>0.05</td><td>0.17</td><td>0</td><td>0</td><td>0.08</td><td>0.11</td><td>0.06</td><td>0.14</td><td>0.1</td></tr><tr><td>3</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr><tr><td>4</td><td>0.03</td><td>0.13</td><td>0</td><td>0</td><td>0.04</td><td>0.05</td><td>0.04</td><td>0.11</td><td>0.09</td></tr><tr><td>5</td><td>0</td><td>0.07</td><td>0</td><td>0</td><td>0</td><td>0.03</td><td>0</td><td>0.06</td><td>0</td></tr><tr><td>6</td><td>0</td><td>0.01</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr><tr><td>7</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr><tr><td>8</td><td>0</td><td>0.02</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr><tr><td>9</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr><tr><td>10</td><td>0</td><td>0.04</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0.02</td><td>0</td></tr><tr><td>11</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr></tbody></table>

Based on the pavement inspection data at the beginning of year t-1, the difference in PQI between the beginning of year t-1 and the beginning of year t was calculated using the PQI calculation method in this paper. The average PQI of the road surface decreased by six. According to the establishment idea of the above model, it can be seen that the goal of optimizing maintenance decisions in year t is to increase the average PQI of the nine highways by six.

## 3.3.2. Maintenance Decision Optimization

By conducting field investigations in different road sections, the $b _ { i , j } ,   E _ { i , j } ,$ and $G _ { i , j }$ of five common maintenance strategies for different road sections in this network were determined, as listed in Tables 10–12.

Table 10. $b _ { i , j }$ of different road sections with different maintenance strategies (10,000 CNY/km).

<table><tbody><tr><td></td><td colspan="9">Road Number</td></tr><tr><td></td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td></tr><tr><td>Routine maintenance</td><td>5</td><td>5</td><td>4.5</td><td>4.5</td><td>4</td><td>4</td><td>4.5</td><td>4</td><td>4</td></tr><tr><td>Paving of overlay</td><td>20</td><td>20</td><td>18</td><td>18</td><td>15</td><td>15</td><td>18</td><td>15</td><td>15</td></tr><tr><td>Paving of anti-skid layer</td><td>15</td><td>15</td><td>13</td><td>13</td><td>12</td><td>12</td><td>13</td><td>12</td><td>12</td></tr><tr><td>Paving reconstruction</td><td>50</td><td>50</td><td>45</td><td>45</td><td>40</td><td>40</td><td>45</td><td>40</td><td>40</td></tr><tr><td>Structural reinforcement</td><td>40</td><td>40</td><td>35</td><td>35</td><td>30</td><td>30</td><td>35</td><td>30</td><td>30</td></tr></tbody></table>

Table 11. $E _ { i , j }$ of different road sections with different maintenance strategies (10,000 CNY/km).

<table><tbody><tr><td></td><td colspan="9">Road Number</td></tr><tr><td></td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td></tr><tr><td>Routine maintenance</td><td>0.2</td><td>0.2</td><td>0.15</td><td>0.15</td><td>0.1</td><td>0.1</td><td>0.15</td><td>0.1</td><td>0.1</td></tr><tr><td>Paving of overlay</td><td>0.7</td><td>0.7</td><td>0.6</td><td>0.6</td><td>0.5</td><td>0.5</td><td>0.6</td><td>0.5</td><td>0.5</td></tr><tr><td>Paving of anti-skid layer</td><td>0.5</td><td>0.5</td><td>0.4</td><td>0.4</td><td>0.4</td><td>0.4</td><td>0.4</td><td>0.4</td><td>0.4</td></tr><tr><td>Paving reconstruction</td><td>1.7</td><td>1.7</td><td>1.5</td><td>1.5</td><td>1.3</td><td>1.3</td><td>1.5</td><td>1.3</td><td>1.3</td></tr><tr><td>Structural reinforcement</td><td>1.3</td><td>1.3</td><td>1.1</td><td>1.1</td><td>1</td><td>1</td><td>1.1</td><td>1</td><td>1</td></tr></tbody></table>

Table 12. $G _ { i , j }$ of different road sections with different maintenance strategies (10000 CNY/km).

<table><tbody><tr><td></td><td colspan="9">Road Number</td></tr><tr><td></td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td></tr><tr><td>Routine maintenance</td><td>0.5</td><td>0.5</td><td>0.45</td><td>0.45</td><td>0.4</td><td>0.4</td><td>0.45</td><td>0.4</td><td>0.4</td></tr><tr><td>Paving of overlay</td><td>2.1</td><td>2.1</td><td>1.9</td><td>1.9</td><td>1.5</td><td>1.5</td><td>1.7</td><td>1.4</td><td>1.4</td></tr><tr><td>Paving of anti-skid layer</td><td>1.5</td><td>1.5</td><td>1.3</td><td>1.3</td><td>1.2</td><td>1.2</td><td>1.3</td><td>1.2</td><td>1.2</td></tr><tr><td>Paving reconstruction</td><td>5</td><td>5</td><td>4.5</td><td>4,5</td><td>4</td><td>4</td><td>4.5</td><td>4</td><td>4</td></tr><tr><td>Structural reinforcement</td><td>4</td><td>4</td><td>3.5</td><td>3.5</td><td>3</td><td>3</td><td>3.5</td><td>3</td><td>3</td></tr></tbody></table>

Based on the above assumptions, the $C _ { k , j }$ values after applying different maintenance strategies under different combinations are shown in Table 13. The corresponding coefficient matrices of $t _ { k , j }$ and $o _ { k , j }$ are shown in Tables 14 and 15, respectively.

Table 13. $C _ { k , j }$ values after applying different maintenance strategies under different combinations.

| Combination | Routine Maintenance | Paving of Overlay | Paving of Anti-Skid Layer | Paving Reconstruction | Structural Reinforcement |
| --- | --- | --- | --- | --- | --- |
| 1 | 0 | 8.75 | 1.9 | 12.65 | 12.65 |
| 2 | 0 | 16.625 | 1.9 | 20.525 | 20.525 |
| 3 | 0 | 23.635 | 1.9 | 32.775 | 32.775 |
| 4 | 0 | 11.9 | 1.9 | 19.3 | 19.3 |
| 5 | 0 | 19.775 | 1.9 | 27.175 | 27.175 |
| 6 | 0 | 26.775 | 1.9 | 39.425 | 39.425 |
| 7 | 0 | 19.25 | 1.9 | 33.3 | 33.3 |
| 8 | 0 | 27.125 | 1.9 | 41.175 | 41.175 |
| 9 | 0 | 34.125 | 1.9 | 53.425 | 53.425 |
| 10 | 0 | 19.775 | 6.9 | 40.175 | 40.175 |
| 11 | 0 | 19.775 | 5 | 40.275 | 40.275 |

Table 14. The $t _ { k , j }$ matrix used in the developed model.

| Combination | Routine Maintenance | Paving of Overlay | Paving of Anti-Skid Layer | Paving Recon-struction | Structural Re-inforcement |
| --- | --- | --- | --- | --- | --- |
| 1 | 0 | 0.001449 | 0 | 0.001449 | 0.001449 |
| 2 | 0 | 0.004608 | 0 | 0.004608 | 0.004608 |
| 3 | 0 | 0.014007 | 0 | 0.015456 | 0.015456 |
| 4 | 0 | 0.001449 | 0 | 0.001449 | 0.001449 |
| 5 | 0 | 0.004608 | 0 | 0.004608 | 0.004608 |
| 6 | 0 | 0.014007 | 0 | 0.015456 | 0.015456 |
| 7 | 0 | 0.001449 | 0 | 0.001449 | 0.001449 |
| 8 | 0 | 0.004608 | 0 | 0.004608 | 0.004608 |
| 9 | 0 | 0.014007 | 0 | 0.015456 | 0.015456 |
| 10 | 0 | 0.004608 | 0 | 0.004608 | 0.004608 |
| 11 | 0 | 0.004608 | 0 | 0.004608 | 0.004608 |

Table 15. The $o _ { k , j }$ matrix used in the developed model.

| Combination | Routine Maintenance | Paving of Overlay | Paving of Anti-Skid Layer | Paving Recon-struction | Structural Re-inforcement |
| --- | --- | --- | --- | --- | --- |
| 1 | 0 | 1.01773 | 0 | 1.01773 | 1.01773 |
| 2 | 0 | 1.01773 | 0 | 1.01773 | 1.01773 |
| 3 | 0 | 1.01773 | 0 | 1.01773 | 1.01773 |
| 4 | 0 | 0.73904 | 0 | 1.75677 | 1.75677 |
| 5 | 0 | 0.73904 | 0 | 1.75677 | 1.75677 |
| 6 | 0 | 0.73904 | 0 | 1.75677 | 1.75677 |
| 7 | 0 | 0.962518 | 0 | 2.719288 | 2.719288 |
| 8 | 0 | 0.962518 | 0 | 2.719288 | 2.719288 |
| 9 | 0 | 0.962518 | 0 | 2.719288 | 2.719288 |
| 10 | 0 | 0.73904 | 0 | 1.75677 | 1.75677 |
| 11 | 0 | 0.73904 | 0 | 1.75677 | 1.75677 |

For the optimization model of highway pavement maintenance decision making established in this paper, as mentioned above, the 0–1 mathematical programming method is used, and the programming calculation is carried out using Lingo 18.0 software. The specific programming is as follows:

The first step is to determine the minimum maintenance budget funds. Part of theFOR PEER REVIEW code is shown in Figure 4.

```matlab
Lingo 18.0 - [Lingo Model - Determination of minimum funds]
File Edit
H 5 e ?
model:
sets:
ivary/1..9/:L;
jvary/1..5/;
kvary/1..11/;
linkikj (ivary, kvary, jvary) :a;
linkik(ivary, kvary) :D;
linkij (ivary, jvary) :b;
linkkj (kvary, jvary) :C;
endsets
min=Bt;
Bt=@sum (1inkikj (i, k, j) :a (i, k, j) *L (i) *D (i, k) *b (i, j)) ;
@for (ivary(i) :@for (kvary (k) :@sum(jvary(j) :a (i, k, j)) <=1)) ;
@sum (1inkikj (i, k, j) : a (i, k, j) *L (i) *D (i, k) *C (k, j) ) >=6702 ;
@for (ivary(i) :a(i, 10,1) =0) ;
@for (ivary(i) :a (i, 10, 2) =0) ;
@for (ivary (i) :a (i, 10, 4) =0) ;
@for (ivary(i) :a (i, 10, 5) =0) ;
```

g .Figure 4. Determination of minimum funds.

Obtain a minimum maintenance fund of CNY 107.26 million, as shown in Figure 5,Obtain a minimum maintenance fund of CNY 107.26 million, as shown in Figure 5, and substitute it for the second step. The second step is to determine the optimal solution,and substitute it for the second step. The second step is to determine the optimal solution, and partial code of the result is shown in the Figure 6.and partial code of the result is shown in the Figure 6

<table><tr><td colspan="4">Lingo 18.0 - [Solution Report - Determination of minimum funds] Window</td></tr><tr><td colspan="4">File Edit Solver Help DH 区 8</td></tr><tr><td>Global optimal solution found.</td><td></td><td>田 ??</td><td></td></tr><tr><td>Objective value:</td><td>10726.73</td><td></td><td></td></tr><tr><td>Objective bound:</td><td></td><td>10726.73</td><td></td></tr><tr><td>Infeasibilities:</td><td></td><td>0.000000</td><td></td></tr><tr><td>Extended solver steps:</td><td></td><td>0</td><td></td></tr><tr><td>Total solver iterations:</td><td></td><td>48</td><td></td></tr><tr><td>Elapsed runtime seconds:</td><td></td><td>0.07</td><td></td></tr><tr><td>Model Class:</td><td></td><td>MILP</td><td></td></tr><tr><td>Total variables:</td><td>406</td><td></td><td></td></tr><tr><td>Nonlinear variables:</td><td>0</td><td></td><td></td></tr><tr><td>Integer variables:</td><td>405</td><td></td><td></td></tr><tr><td>Total constraints:</td><td>102</td><td></td><td></td></tr><tr><td>Nonlinear constraints:</td><td>0</td><td></td><td></td></tr><tr><td>Total nonzeros:</td><td>659</td><td></td><td></td></tr><tr><td>Nonlinear nonzeros:</td><td>0</td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td></tr><tr><td></td><td>Variable BT</td><td>Value 10726.73</td><td>Reduced Cost 0.000000</td></tr><tr><td></td><td>L(1)</td><td>208.0000</td><td>0.000000</td></tr><tr><td></td><td></td><td>74.00000</td><td></td></tr><tr><td></td><td>L(2)</td><td></td><td>0.000000</td></tr></table>

Figure 5.Figure 5. Result of minimum funds.Result of minimum funds

| Solution Report - optimization M |
| --- |
| A( 1, 9, 4) 0.000000 |
| A( 1, 9, 5) 0.000000 |
| A( 1, 10, 1) 0.000000 |
| A( 1, 10, 2) 0.000000 |
| A( 1, 10, 3) 1.000000 |
| A( 1, 10, 4) 0.000000 |
| A( 1, 10, 5) 0.000000 |
| A( 1, 11, 1) 0.000000 |
| A( 1, 11, 2) 0.000000 |
| A( 1, 11, 3) 0.000000 |
| A( 1, 11, 4) 0.000000 |
| A( 1, 11, 5) 1.000000 |
| A( 2, 1, 1) 0.000000 |
| A( 2, 1, 2) 0.000000 |
| A( 2, 1, 3) 0.000000 |
| A( 2, 1, 4) 0.000000 |
| A( 2, 1, 5) 0.000000 |
| A( 2, 2, 1) 0.000000 |
| A( 2, 2, 2) 1.000000 |

Figure 6. Result of the optimal solutionFigure 6. Result of the optimal solution.

The specific maintenance plan is shown in Table 1The specific maintenance plan is shown in Table 16.

Table 16. Optimal maintenance methods on the different road sections under different combinations.

<table><tbody><tr><td rowspan="2">Combination</td><td colspan="9">Road Number</td></tr><tr><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td></tr><tr><td>1</td><td></td><td></td><td>II</td><td></td><td>II</td><td>II</td><td></td><td>II</td><td>II</td></tr><tr><td>2</td><td>II</td><td>II</td><td></td><td></td><td>II</td><td>II</td><td>II</td><td>II</td><td>II</td></tr><tr><td>3</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr><tr><td>4</td><td>II</td><td>II</td><td></td><td></td><td>II</td><td>V</td><td>V</td><td>V</td><td>V</td></tr><tr><td>5</td><td></td><td>II</td><td></td><td></td><td></td><td>II</td><td></td><td>V</td><td></td></tr><tr><td>6</td><td></td><td>V</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr><tr><td>7</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr><tr><td>8</td><td></td><td>V</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr><tr><td>9</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr><tr><td>10</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td></tr><tr><td>11</td><td>V</td><td>V</td><td>V</td><td>V</td><td>V</td><td>V</td><td>V</td><td>V</td><td>V</td></tr></tbody></table>

II represents paving of overlay, III indicates the paving of anti-skid layer, and V denotes the structural reinforcement.

## 4. Conclusions

This study is based on the analysis of the current research status of domestic networklevel road maintenance decision making and establishes an optimization model for road maintenance decision making that comprehensively considers maintenance funds, road performance, user costs, and environmental costs. Based on case analysis, the following conclusions are drawn:

(1) Based on existing research, the user costs that affect the effectiveness of road maintenance were determined as the cost of vehicle travel time and the cost of vehicle fuel consumption, and quantitative models were established for each.

(2) Based on a user cost quantification model that affects the effectiveness of pavement maintenance, and applying the AHP model, an evaluation system for the effectiveness of highway asphalt pavement maintenance was established. A network-level pavement maintenance decision-making optimization model was established with the objective function of maximizing comprehensive maintenance benefits.

(3) Taking a certain road network in a certain province as an example for network-level maintenance decision making, the final maintenance plan was obtained using Lingo software. The case results validate the effectiveness of the proposed optimization model, indicating that the research findings of this article can assist decision makers in making road maintenance decisions more reasonably by considering the diversity of practical problems from multiple perspectives.

In addition, this study also has the following shortcomings: Firstly, when analyzing the quantification of vehicle operating costs, this article only considers one type of passenger car. In order to construct a more comprehensive user cost quantification model from a more comprehensive perspective, future research can increase the consideration of other vehicle models. Secondly, when building the network-level pavement maintenance decision model, this paper does not consider the user costs caused by the closure or semi-closure of road sections due to construction barriers. Finally, for future research, more components of user costs (e.g., vehicle safety costs and vehicle tire wearing costs) and environmental costs (traffic noise pollution costs) can be incorporated into the optimization model.

**Author Contributions:** Conceptualization, X.G.; Methodology, X.G. and H.Z.; Software, X.Z.; Validation, X.Z.; Formal analysis, $\bar { \mathsf { X } } . \mathsf { D } . \bar { \mathsf { , } }$ Resources, X.D. and Y.B.; Data curation, M.S.; Writing—original draft, X.G.; Writing—review & editing, M.S. and Y.B.; Supervision, H.Z. All authors have read and agreed to the published version of the manuscript.

**Funding:** This research received no external funding.

**Institutional Review Board Statement:** Not applicable.

**Informed Consent Statement:** Not applicable.

**Data Availability Statement:** Not applicable.

**Conflicts of Interest:** The authors declare no conflict of interest.

## References

1. Peng, H.; Chen, C.; Sun, L.J. Double layer optimization of project optimization models in network level pavement management systems. J. Tongji Univ. (Nat. Sci. Ed.) 2010, 38, 380–385.

2. Feng, S.K. Research on Multi-Objective Pavement Maintenance Decision-Making Optimization Considering Uncertainty Factors. Master’s Thesis, Chang’an University, Xi’an, China, 2020.

3. Li, Z.; Sinha, K.C. Methodology for Multicriteria Decision Making in Highway Asset Management. Transp. Res. Rec. J. Transp. Res. Board 2004, 1885, 79–87. [[CrossRef](https://doi.org/10.3141/1885-12)]

4. Li, L. Model Optimization and Benefit Evaluation of Total Highway Maintenance Cost. Master’s Thesis, Chang’an University, Xi’an, China, 2018.

5. Li, H.M. Research on Maintenance Decision of Asphalt Pavement of Network Expressway Based on Matter Element Model. Ph.D. Thesis, Southeast University, Nanjing, China, 2017.

6. Zhang, H.; Keoleian, G.A.; Lepech, M.D.; Kendall, A. Life-Cycle Optimization of Pavement Overlay Systems. J. Infrastruct. Syst. 2010, 16, 310–322. [[CrossRef](https://doi.org/10.1061/%28ASCE%29IS.1943-555X.0000042)]

7. Elhadidy, A.A.; Elbeltagi, E.E.; Ammar, M.A. Optimum analysis of pavement maintenance using multi-objective genetic algorithms. HBRC J. 2015, 11, 107–113. [[CrossRef](https://doi.org/10.1016/j.hbrcj.2014.02.008)]

8. Bryce, J.M.; Flintsch, G.; Hall, R.P. A multi criteria decision analysis technique for including environmental impacts in sustainable infrastructure management business practices. Transp. Res. Part D Transp. Environ. 2014, 32, 435–445. [[CrossRef](https://doi.org/10.1016/j.trd.2014.08.019)]

9. Xie, F. Research on Intelligent Decision Model of Highway Pavement Management Based on GIS. Ph.D. Thesis, Southwest Jiaotong University, Chengdu, China, 2012.

10. Mao, X.H. Research on Improvement of Decision Model for Highway Pavement Maintenance. Ph.D. Thesis, Chang’an University: Xi’an, China, 2015.

11. JTG H20-2007; Highway Performance Assessment Standards. Standard Prees of China: Beijing, China, 2007.

12. JTJ 073; Technical Specifications for Maintenance of Highway Asphalt Pavement. Standard Prees of China: Beijing, China, 2001.

13. Silva, C.M.; Farias, T.L.; Frey, H.C.; Rouphail, N.M. Evaluation of numerical models for simulation of real-world hot-stabilized fuel consumption and emissions of gasoline light-duty vehicles. Transp. Res. Part D Transp. Environ. 2006, 11, 377–385. [[CrossRef](https://doi.org/10.1016/j.trd.2006.07.004)]

14. Flintsch, G.W.; Kuttesch, J. Engineering Economic Analysis Tools for Pavement Management. In Proceedings of the International Conference on Bituminous Mixtures & Pavements, Thessaloniki, Greece, 5 November 2002.

15. American Association of State Highway and Transportation Officials. User Benefit Analysis for Highways Manual; American Association of State Highway and Transportation Officials: Washington, DC, USA, 2003.

16. Hua, L. Research on Network Level Pavement Maintenance Fund Decision Based on NSGAII+DRSA Method. Master’s Thesis, Changsha University of Science and Technology, Changsha, China, 2020.

17. Li, T.; Zhang, P.L.; Mao, X.H. Optimal decision-making for road maintenance considering the dynamic distribution of traffic flow. Chin. J. Highw. Eng. 2019, 32, 7.

18. Becker, G.S. A theory of the allocation of time. Econ. J. 1965, 75, 93–517. [[CrossRef](https://doi.org/10.2307/2228949)]

19. Mark, W. A review of British evidence on time and service quality valuations. Transp. Res. Part E 2001, 37, 107–128.

20. Zong, F.; Juan, Z.C.; Zhang, H.Y.; Jia, H.F. Research on the Calculation and Application of Travel Time Value. Transp. Syst. Eng. Inf. 2009, 9, 6.

21. Scora, G.; Barth, M. Comprehensive Modal Emissions Model (CMEM), Version 3.01. User Guide, Centre for Environmental Research and Technology; University of California: Riverside, CA, USA, 2006.

22. Chau, K.T.; Wong, Y.S.; Chan, C.C. EVSIM—A PC-based simulation tool for an electric vehicle technology course. Int. J. Electr. Eng. Educ. 2000, 37, 167–179. [[CrossRef](https://doi.org/10.7227/IJEEE.37.2.6)]

23. Frey, H.C.; Rouphail, N.M.; Zhai, H.; Farias, T.L.; Gonçalves, G.A. Comparing real-world fuel consumption for diesel- and hydrogen-fueled transit buses and implication for emissions. Transp. Res. Part D Transp. Environ. 2007, 12, 281–291. [[CrossRef](https://doi.org/10.1016/j.trd.2007.03.003)]

24. Zhou, Y.; Zhang, H.R. Research on relation between of surface characteristics and fuel consumption. Highways 2005, 1, 30–36.

25. Yao, Z.K. Research on Optimization Methods in Network Level Pavement Management System. J. China Highw. Eng. 1994, 7, 1–9.