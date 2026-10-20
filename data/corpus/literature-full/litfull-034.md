<!--
SOURCE: 原始 PDF: reference/背景知识/2020-The Journal of Supercomputing-Prediction of highway asphalt pavement performance based on Markov chain and artificial neural network approach.pdf | 页数: 23 | 集合: reference
题录: litfull-034 Prediction of highway asphalt pavement performance based on Markov chain and artificial ne
提取: MinerU markdown 全文（可重建索引的真相源副本；images/ 不入 corpus）
-->
![](images/page_0_image_1.jpg)

# Prediction of highway asphalt pavement performance based on Markov chain and artificial neural network approach

**Zhichen Wang**<strong><sup>1</sup></strong> **· Naisheng Guo**<strong><sup>1</sup></strong> **· Shuang Wang**<strong><sup>2</sup></strong> **· Yang Xu**<strong><sup>3</sup></strong>

Published online: 16 May 2020

© Springer Science+Business Media, LLC, part of Springer Nature 2020

## Abstract

In order to study the problems of inadequate maintenance measures, inappropriate maintenance time, and unreasonable use of funds in asphalt pavement maintenance of Highway in China, the maintenance of highway pavement is taken as the research object in this study, and a prediction model is established for preventive maintenance performance of highway by using neural network. Firstly, the performance of pavement is evaluated. The pavement performance prediction model is studied, and some mature prediction models are introduced. It is concluded that for the early built highways, the models are used when the acceptance of maintenance and preventive maintenance concepts is poor and the pavement performance shows a decreasing trend, but for the existing maintenance and preventive maintenance sections, the pavement performance detection shows a wave. The dynamic descent section is not suitable. The results show that the forecasting model proposed in this study is consistent with the development trend of the measured results, and can be used to predict the pavement performance under this model. Therefore, a theoretical basis is provided for the investment of highway maintenance funds and the scientific selection of maintenance schemes. The study has important guiding significance for the future highway management units in the selection of maintenance measures, the determination of maintenance timing, and the size of capital investment.

**Keywords** Preventive maintenance · Prediction model · Asphalt pavement · Neural network

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">\* Zhichen Wang zhichenwang@dlmu.edu.cn</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">Extended author information available on the last page of the article</span></small>

## 1 Introduction

Since 1990, China’s highway development has entered a brand-new stage with the construction of high-tech highway, which brings about the increase of highway construction mileage and the increase of pavement service life. China’s highway has gradually transited from the initial large-scale construction to the maintenance and management of pavement. According to reliable statistics, it is the highway built before 1998 that must be overhauled. Because of the serious degree of pavement damage, it is necessary to maintain the highway built after 1998, and the pavement has some degree of damage. Since the maintenance of the pavement needs a lot of financial support, the state spends a lot of money every year to ensure the normal operation of the existing highway network. However, the annual cost of road maintenance is only one-half of the cost of road maintenance, and the fund gap for road maintenance cannot be met [1].

The development of the highway is reflected not only in the construction of the highway but also in the maintenance and management of the highway. With the continuous construction and improvement of highway in China, besides thinking about how to make the highway network more perfect, it is also necessary to think about how to maintain the integrity of the highway network, prolong the service life of the highway pavement, reduce the maintenance cost of the pavement, and improve the technical indicators of the pavement [2]. This important research topic is the key to improve the comfort and safety of the highway, and also the key to reducing the cost of highway consumption. It provides a basis for economic and convenient maintenance of highway pavement. Most highways in China use asphalt pavement. Because of the large capacity of the pavement on the highway and the fast speed of the vehicles, the pavement condition of the highway should be kept in good condition at all times. Otherwise, it will endanger the safety of the vehicles in the course of driving. However, under the heavy load of the vehicles and the adverse influence of the weather, highway pavement service level will continue to decline. Cracks, pits, and other problems will begin to appear. In order to ensure the safety of vehicles and improve the performance of highway, it is necessary to study new technology to complete the Maintenance of Highway Asphalt Pavement.

Therefore, it is necessary to study the decay law of asphalt pavement performance in order to determine the best time for scientific maintenance and formulate a scientific maintenance design scheme. At the same time, it has an important social and economic significance to extend the service life of the road, build a harmonious and smooth travel environment, meet the technical requirements of highway management and maintenance work, and improve the efficiency of highway maintenance. In order to provide decision support for pavement maintenance project selection, maintenance scheme and maintenance fund allocation, enhance the scientificity of maintenance project investment decision, reduce the error rate of investment decision, reduce investment risk, and give full play to the benefits of maintenance fund, in this study, the combination prediction model of Markov chain and neural network is adopted to systematically study the key technology of expressway pavement maintenance management, the prediction of pavement performance. The research results will help the management department to improve the scientificity, rationality, and effectiveness of the decision-making plan, and expand the scope of decision making. Moreover, it will vigorously promote the theoretical research of expressway pavement maintenance management optimization decision making and will also enrich the research and application of combination prediction in the field of expressway management.

## 2  Literature review

The first systematic pavement performance evaluation model in the world is the PSI (Present Serviceability Index) pavement performance evaluation model proposed by AASHTO (American Association of State Highway & Transportation Officials) in America in the 1960s. It is proposed on the basis of experimental data observation results in the past decade. It has a profound impact on the road maintenance management technology in the 1970s, especially on the development of the road management system, and has played a huge role in promoting. After that, taking the American AASHTO PSI model as an example, Canada, Japan, and many countries and regions including China have also studied and established pavement performance evaluation models with different concepts and meanings, which are used for the evaluation of pavement conditions and play a certain role in pavement maintenance management. For example, in 1981, IIJIMA in Japan developed the MCI (maintenance control index) evaluation model. The biggest difference between MC1 and PSI (Population Stability Index) is that PSI is from the perspective of road users, while MCI is from the perspective of road managers.

The research of pavement management system in China began in 1984. In 1985, China first transplanted the British asphalt pavement maintenance management system in Yingkou, Liaoning Province, and then successively introduced the British BSM (Business Service Management) pavement evaluation system, the World Bank highway investment benefit analysis model, etc. During the Seventh Five Year Plan period, many research institutes and highway management departments jointly (or separately) developed a series of pavement management systems. Dr. Pan Yuli, from the Institute of highway science, Ministry of communications, put forward the basic framework of China’s highway pavement management system, and established some models in line with China’s reality. Through cooperation between Tongji University and Beijing and Guangdong Highway Administration Bureau, the evaluation system of asphalt pavement service performance has been established systematically, and the method of selecting pavement maintenance countermeasures has been determined. CPMS (China pavement management system) has made great contribution to the development and application of China’s pavement management system. As a key promotion project of the Ministry of transport, CPMS has been applied in many provinces and cities in China.

In the aspect of preventive maintenance of highway, scholars have done a lot of research. Wu et al. [3] took a highway pavement section as an example to optimize the combination of preventive maintenance (PM) treatment and time arrangement.

In the optimization process, the key infrastructure management concepts of treatment specific trigger, performance jump model, and performance trend model were combined [3]. Liu et  al. [4] suggested preventive maintenance before the serious deterioration of the highway began, which is more cost-effective than rehabilitation. The larger the traffic volume on the highway, the sooner the pavement will reach the inflection point. Life cycle cost analysis (LCCA) method is used to calculate the optimal application time of preventive maintenance treatment [4]. France-Mensah et al. [5] constructed a framework of road preventive maintenance management system based on SOA using service-oriented architecture and further studied the service bus of the framework using workflow examples, which verified the availability and effectiveness of the framework. The concept of pavement preventive maintenance (PPM) has been accepted by more and more road managers. Hermawan et al. [6] considered that the concept of pavement preventive maintenance (PPM) has been accepted by more and more highway managers, and the optimal strategy decision making and life cycle cost analysis (LCCA) of PPM in the whole life cycle of roads are deeply and systematically studied [6]. Lu and Qiang [7] discussed the pretreatment scheme of using the brines for road maintenance in winter and studied the field durability of brine for various applications on portland cement concrete and asphalt concrete pavement. Shah et al. [8] proposed a deterioration prediction model, which considers the occurrence of road pits and the deterioration probability of reinforced concrete slabs, and determines the optimal detection interval of reinforcement. Fan et  al. [9] established a comprehensive life cycle cost analysis (LCCA) model to quantify the impact of pavement maintenance on agency costs and vehicle operating costs (VOC) and analyzed the optimal timing of maintenance treatment. Seo et  al. [10] extracted international roughness index (IRI) data from Special Pavement Research 3 (SPS-3) of Long-term Pavement Performance (LTPP) project to determine the long-term effectiveness of maintenance treatment on IRI degradation. The results show that traffic loads and initial IRI values have a significant impact on pavement maintenance-induced life extension and agency cost-effectiveness [10]. During the service life of wheat (2017) pavement, it has been proved that wheat (2017) can significantly improve its performance and reduce its deterioration rate by maintaining the pavement at a high level through preventive maintenance. Liu et al. [11] introduced the application of data envelopment analysis (DEA) in highway maintenance settings. Through the application of DEA in highway settings, a general framework for performance measurement is established. The framework includes a performance pyramid, which reflects multiple perspectives of the organization. Its structure includes a measurement structure that links key success factors with process drivers, data analysis methods, and occupational culture.

Many scholars have also studied the performance prediction of asphalt pavement. Abaza (2016) proposed a forecasting model for permanent deformation of asphalt pavement based on improved grey forecasting model [12]. The improved forecasting model combines the first-order two-variable grey differential equation model (GM (1, 2) model) in the grey system theory and the Taylor approximation method in approximate optimization theory [13]. Lee et al. [14] established six rutting prediction models of asphalt mixture shear strength, pavement structure shear stress, load repetition times, pavement temperature, speed, and pavement depth, and established a rutting prediction model with high prediction accuracy and wide application range. Premkumar and Vavrik [15] proposed a new method for predicting permanent deformation of asphalt pavement based on linear superposition theory, which considers pavement temperature, pavement depth, loading times, load size, deviation stress, and creep coefficient of pavement structure. Yang et al. [16] introduced the concept of cumulative damage, put forward the necessary parameters and concrete steps of fatigue life prediction based on cumulative damage, and predicted the fatigue life of asphalt pavement in rich water area (freeze–thaw simulation) and dry climate area (rain-free damage). Mazari et al. [17] studied the application of artificial neural network (ANN) in the fatigue life prediction of rubber asphalt concrete mixtures with recycled asphalt pavement (RAP). The results show that compared with the traditional statistical prediction model, the artificial neural network technology is more effective in predicting the fatigue life of the modified mixtures [17]. Ozer et al. [18] proposed a calculation model of asphalt pavement degradation under multi-axle moving traffic loads. Based on a viscoelastic finite element method (FEM), this method is specially used for asphalt pavement under multi-axle traffic loads. It relies on the following variables: pavement structure, load speed, load allocation, and asphalt material temperature [18]. Abaza [19] introduced an improved BP neural network model to establish the winter temperature prediction model of pavement. According to the model, the daily temperature of pavement can be accurately pre-dicted by combining dynamic and static prediction. Mehran et al. [17] studied the factors affecting rutting prediction and rutting prediction model of asphalt pavement through aggregate gradation test of asphalt mixture. Finally, the rutting prediction equation of asphalt pavement under different reliability levels is given.

A lot of works have been done on pavement maintenance decisions globally, and many methods have been proposed. The California Pavement Management System adopts a decision tree, compares and chooses corresponding maintenance measures according to the pavement damages, selects the countermeasures that can repair all damage as the main countermeasures, and finally, determines the order of maintenance for each road segment according to the pavement damage rating and the pre-established ranking table. Fwa has proposed a two-step method for determining the maintenance order. First, the genetic algorithm is used to establish the optimal weight database for road conditions  [20]. Then, the neural networks are used for analysis and training to achieve the prioritization of maintenance programs. Fazil T. Najafi has proposed a cost–benefit analysis-based five-step analysis method, i.e., road condition collection, road network information summary, maintenance plan cost, maintenance priority, and maintenance implementation plan.

In China, Pan Yuli et  al. have proposed a two-step method for optimization of maintenance management decisions using linear programming principles. Zou Peiguo uses an analytic hierarchy model and heuristic optimization techniques to determine when and what measures to take in which situations can gradually reach the specified service level, while the total cost is minimal. Zhou Wei et  al. have constructed the utility function of highway alternative maintenance countermeasures by introducing the two indicators of utility and value; in addition, they have determined the maintenance needs of the project according to the principle of maximum utility [21]. At the same time, the project value function is constructed, which utilizes the size of the social value of the project to reflect the urgent degree of maintenance, thereby organizing the order of maintenance. He Zhaoyi has proposed a onelevel analysis method for systematic analysis of asphalt pavement maintenance and reconstruction strategies, which can be used to give pavement maintenance decisions based on a single index. When considering the different weight distribution between each index, the membership function proposed by Sun Lijun is considered; in the meantime, the subjective assignment method is utilized to determine the weight [22].

In summary, road experts at home and abroad begin to apply other mathematical theories and methods to the field of pavement performance evaluation, such as grey evaluation method, analytic hierarchy process, fuzzy mathematics analysis method, genetic neural network analysis method, matter element model analysis method, and so on. The introduction of these mathematical theories improves the accuracy and applicability of pavement performance evaluation model. Limited maintenance funds are allocated to the most needed sections in time, and pavement damage data detection equipment is developed. In addition, the database is established, and specific evaluation methods, standards, and priority maintenance sequencing models are established. The forecasting model is poor in portability and integrity. The unification of predictive indicators and the use of comprehensive performance indicators still need a lot of research. Combining the application scope of the above model and the knowledge of maintenance management, the combined forecasting model of Markov and neural network is formed in this study on the basis of the combined forecasting idea. Neural network method avoids its defects and shortcomings, in order to achieve a comprehensive evaluation of the performance of expressway asphalt pavement and to provide a basis for the rational formulation of the maintenance plan and investment decision making in the later period.

## 3  Proposed method

## 3.1  BP neural network

Based on the theory of neural network, a comprehensive evaluation model of expressway asphalt pavement performance is established. Based on the analysis of the existing theories and the training simulation of the survey data, the performance evaluation model of expressway asphalt pavement is established. As the main branch of artificial intelligence, the neural network is characterized by fully simulating the human brain thinking mode and the genetic process of biological evolution, and can accurately simulate the changing law of road performance. Therefore, the theory of using this intelligent method as the evaluation model of expressway pavement performance is well documented and effective.

As one of the most widely used neural networks, the BP network can realize mapping when the mathematical equation of mapping relationship is unknown. In fact, it has been proved that for a BP neural network, as long as there are enough training samples, it can complete the nonlinear mapping from the input layer to the output layer [23]. The adjustment process of the weight vector is to extract statistical rules from all training samples. The process depends on all samples, and the error of individual samples cannot affect the adjustment of the weight vector. BP network has a certain fault-tolerant ability, allowing individual samples with errors or even errors in training samples [24]. BP network is very easy to be realized by computer programming language, and the samples are input into the network training successfully and the weights and threshold vectors are stored. In the future, the application of the model can be realized by loading the weight and threshold vectors and simulating them, which is very easy to implement.

At present, the most widely used network type is a multi-layer feedforward network based on the BP algorithm, while a single hidden layer network is widely used. The three-layer perceptron mainly is output layer, hidden layer, and input layer. Figure 1 is a common three-layer BP network diagram.

As can be seen in the BP network diagram, from bottom to top, they are input layer, hidden layer, and output layer. It is assumed that $X = \left( x _ { 1 } ,   x _ { 2 } ,   \ldots ,   x _ { i } ,   \ldots ,   x _ { n } \right) ^ { \mathrm { T } }$ is the input vector and the design threshold of the hidden layer is $x _ { 0 } = - 1$

It is assumed that $\boldsymbol { Y } =   \left( y _ { 1 } ,   y _ { 2 } , \ldots ,   y _ { j } , \ldots ,   y _ { m } \right) ^ { \mathrm { T } }$ is the output vector, the design threshold of the output layer is $y _ { 0 } = - 1$ , and the output vector of the output layer is $O = \left( o _ { 1 } ,   o _ { 2 } , \ldots ,   o _ { k } , \ldots ,   \dot { o _ { 1 } } \right) ^ { \mathrm { T } }$ . The expected output vector is $\quad d {  } = {  } {  } \left( {  } d _ { {  } 1 } {  } , {  } d _ { {  } 2 } {  } , {  } \ldots {  } d _ { {  } k } {  } , {  } d _ { {  } l } {  } \right) ^ { {  } _ { 1 } }$ $V = \left( V _ { 1 } ,   V _ { 2 } , \ldots V _ { j } , \ldots , V _ { m } \right)$ is the weight matrix, and $W = \left( W _ { 1 } , \; \dot { W _ { 2 } } , \ldots \; W _ { k } , \ldots \; W _ { l } \right)$ is the weight vector.

The mathematical relationships between the layers are as follows:

For the output layer:

$$
\begin{array} { l } { { \displaystyle O _ { K } = f \big ( \mathrm { n e t } _ { k } \big ) , \quad k = 1 , 2 , \ldots , l , } } \\ { { \displaystyle \mathrm { n e t } _ { k } = \sum _ { j = 0 } ^ { m } w _ { j k } y _ { j } \quad k = 1 , 2 , \ldots , l . } } \end{array}\tag{1}
$$

For the hidden layer:

$$
\begin{array} { r } { y _ { j } = f \big ( \mathrm { \tt n e t } _ { j } \big ) , \quad j = 1 , 2 , \ldots , m , } \\ { \mathrm { \tt n e t } _ { j } = \displaystyle \sum _ { i = 0 } ^ { n } \nu _ { i j } x _ { i } \quad j = 1 , 2 , \ldots , m . } \end{array}\tag{2}
$$

Fig. 1   Structural diagram of three-layer BP network

![](images/page_6_image_12.jpg)

The transfer function $f ( x )$ in Eqs. 7 and 8 can be selected according to need. If the unipolar sigmoid function is selected, then:

$$
f ( x ) = { \frac { 1 } { 1 + e ^ { - x } } }\tag{3}
$$

The gradient descent algorithm of error is also called the BP learning algorithm. If the input and output values of the information are different, then there must be an error E. The specific definition expression is as follows:

$$
E = \frac { 1 } { 2 } ( d - 0 ) ^ { 2 } = \frac { 1 } { 2 } \sum _ { k = 1 } ^ { l } \left( d _ { k } - o _ { k } \right) ^ { 2 }\tag{4}
$$

Expansion layer by layer can be expressed as:

$$
E = \frac { 1 } { 2 } \sum _ { k = 1 } ^ { i } \left\{ d _ { k } - f \left[ \sum _ { j = 0 } ^ { m } w _ { j k } f \left( \sum _ { i = 0 } ^ { n } \nu _ { i j } x _ { i } \right) \right] \right\} ^ { 2 }\tag{5}
$$

The purpose of adjusting weights is to reduce errors, so there is a proportional relationship between the errors and the adjustments of weights.

$$
\Delta w_{jk} = - \eta \frac{\partial E}{\partial w_{jk}} \quad j = 0,1,2,\ldots,m; \quad k = 1,2,\ldots,l.\tag{6}
$$

$$
\Delta w _ { i j } = - \eta \frac { \partial E } { \partial \nu _ { i j } } \quad j = 0 , 1 , 2 , \ldots , n ; \quad k = 1 , 2 , \ldots , m .\tag{7}
$$

From the above expression, it can be concluded that the error decreases proportionally with the adjustment of the weight, in which $\eta \epsilon ( 0 , 1 )$ is a constant. It also acts as the proportion coefficient between the weight and the error, which is also the expression of the learning efficiency.

If the unipolar S function is used as the transfer function, the model can be transformed into:

$$
\left\{ \begin{array} { l l } { \Delta w _ { j k } = \eta \delta _ { k } ^ { o } y _ { j } } \\ { \Delta v _ { i j } = \eta \delta _ { j } ^ { y } x _ { i } } \end{array} \right.\tag{8}
$$

Among them:

$$
\delta _ { k } ^ { o } = \big ( d _ { k } - o _ { k } \big ) o _ { k } \big ( 1 - o _ { k } \big )\tag{9}
$$

$$
\delta _ { j } ^ { y } = \Biggl ( \sum _ { k = 1 } ^ { t } \delta _ { k } ^ { o } w _ { j k } \Biggr ) y _ { j } \bigl ( 1 - y _ { j } \bigr ) .\tag{10}
$$

The above equations can be extended to multi-level BP neural network. It can be seen from the figure that the weight adjustment equation of BP algorithm is determined by three main factors, namely learning level, the error input signal of this layer, and input signal of this layer (X or Y). The error signal of the output layer is related to the actual output and expected the output of the network. Therefore, the error signal between the above-hidden layers is related to the error signal of the pre-vious layer, which is reversed layer by layer from the output layer above the hidden layer.

The characteristic of the BP algorithm is that the signal can be propagated either forward or backward in the presence of errors. Figure 2 is the flowchart of the signal propagation.

As can be seen from the figure, the forward process is as follows. After X input, the output signal Y is obtained through the weight vector of each node in each hidden layer. The reverse process is that the adjustment value of the output layer weight is determined according to the difference between the theoretical output signal d and the actual output signal δ.

## 3.2  Markov prediction model

The basic principle of the Markov probability prediction model is to use the Markov chain theory to obtain the probability that the system may reach a certain state in the future according to the current state of the system. Markov chain essentially refers to a discrete stochastic process with no aftereffect, which means that the state of the system in the future is only related to the current state of the system, but not to its past state.

Markov chain is a discrete stochastic process, which has the characteristics of no aftereffect, i.e., the future state of the system is not related to the past but only related to the present. It is assumed that the system has n states in total; then, the initial state distribution $P _ { 0 }$ is:

$$
P _ { 0 } = \big ( p _ { 1 } , p _ { 2 } , \ldots , p _ { n } \big ) , \quad \sum _ { i } p _ { i } = 1\tag{11}
$$

![](images/page_8_image_9.jpg)

Fig. 2   Signal flow diagram of BP network

The transition probability is the probability that the system transitions from state i to state $j$ in one step; the transition probability of a system with n states can form a matrix P, and its specific form is:

$$
P = \left[ p _ { i j } \right] _ { n \times n } \left[ \begin{matrix} { p _ { 1 1 } p _ { 1 2 } \cdots p _ { 1 n } } \\ { p _ { 2 1 } p _ { 2 2 } \cdots p _ { 2 n } } \\ { \cdots \cdots \cdots \cdots } \\ { p _ { n 1 } p _ { n 2 } \cdots p _ { n n } } \end{matrix} \right]\tag{12}
$$

The n-th order transition probability matrix satisfies the general properties of the probability matrix, i.e.,

$$
p _ { i j } \geq 0 , \quad \sum _ { i = 1 } ^ { n } p _ { i j } = 1 ( i , j = 1 , 2 , \ldots , n ) .\tag{13}
$$

It is supposed that the transition probability is static. According to the principle of no aftereffect and the nature of conditional probability, the system state distribution $P _ { k }$ at time k can be obtained:

$$
P _ { k } = P _ { k - 1 } \times P\tag{14}
$$

The most critical problem of the Markov probability prediction model is the determination of the transition probability matrix P. Common methods include empirical judgment, statistical analysis, and regression analysis. The empirical judgment method determines the transition probability matrix subjectively in the absence of historical data, with poor reliability. The statistical analysis method is to use the statistical analysis techniques to calculate the probability that the system will transition from one state to another after a certain period when the historical data are available for a long period. Its calculation workload is large, and the period is long. The accuracy of the transition probability matrix depends on the length and accuracy of historical observation data. The regression analysis method is to use the regression analysis techniques and technology to determine the transition probability matrix in the case of limited historical data. It is necessary to perform regression analysis and prediction on the factors that affect the system change and predict the future state distribution of the system. In the specific forecasting tasks, an appropriate method for determining the transition probability matrix should be selected according to the characteristics of the forecasted object and the situation of historical data.

Expressway pavement maintenance management is a complex process; its optimization decision should be based on actual observation data and subjective experience to make multiple predictions. The combined forecasting method is discussed and analyzed. Based on this, a combined forecasting model combining neural network and Markov model is constructed to predict the performance of pavement and evaluate its results.

## 4  Experiments

Cracks in asphalt pavement can generally be divided into load type and non-load type. Load-type cracks are mainly network cracks or tortoise cracks, which are the manifestations of the pavement bearing capacity cannot meet the requirements of traffic. Non load-type cracks are mainly single or block-shaped, which are usually caused by temperature changes, uneven settlement or frost heave of roadbed, a reflection of cracks in the lower layer, etc.

At present, the method of crack detection based on vehicle-mounted camera and computer identification has not been popularized and applied. Generally, the method of manual field measurement is still used. For a block or network crack, its area $( \mathbf { m } ^ { 2 } )$ is measured directly according to the outer rectangular area parallel to the middle line of the road. For a single crack, the actual length (m) is measured and its calculated width 0.2 m is converted to the area (Fig. 3).

The crack rate (CR, Crack Ratio) is usually used as the index to measure and evaluate the crack condition of the test section. The equation for calculating the fracture rate is as follows:

$$
\mathrm { C R } = ( \mathrm { C A } + L \times 0 . 2 ) / A\tag{15}
$$

![](images/page_10_image_7.jpg)

Fig. 3   Research process of performance prediction of expressway asphalt pavement

Among them: CR is asphalt pavement total crack rate $( \mathrm { m } ^ { 2 } / 1 0 0 0 \mathrm { m } ^ { 2 } )$ ; CA is the crack and block crack total area $( \mathbf { m } ^ { 2 } )$ ; L is the single crack total length (m); A is the test section pavement area, and it is measured in thousands of square meters.

The impacts of various damage types of asphalt pavement on the pavement are different, and the pavement of each section may be damaged in different types, severity, and scope.

In order to quantitatively compare the damage status (or degree) of each section, a comprehensive index is needed to synthesize the condition and influence of different damage types. At present, the commonly used pavement damage indicators are pavement condition index PCI based on deduction method, pavement comprehensive damage rate, and pavement condition index PCI based on pavement comprehensive damage rate.

The pavement condition index based on a comprehensive pavement damage rate is adopted, and its calculation equation is as follows:

$$
\mathrm { P C I } = 1 0 0 - 1 5 . 0 \times \mathrm { D R } ^ { 0 . 4 1 2 }\tag{16}
$$

In the equation, DR (distress ratio) is the pavement damage rate, which is calculated by percentage. The equation is as follows:

$$
\mathrm{DR} = D / A \times 100 = \sum \sum D_{ij.} K_{ij} / A \times 100\tag{17}
$$

In the equation, $D _ { \dot { \boldsymbol { \jmath } } \dot { \boldsymbol { \jmath } } } ,$ i is class i damage, and j is the actual damage area of grade j severity. The damaged area is: crack length $( \mathrm { m } ) ^ { \mathrm { ~ * ~ } } 0 . 2 \mathrm { ~ m }$ . Rutting damage area is length $\mathrm { ( m ) ^ { * } } 0 4$ m. $K _ { i j } ,$ i is class i damage and j is the actual damage area of class j severity. A is the total area of the road surface in the survey section.

There are internal relations among the four pavement performance indicators. The insufficient structural strength of pavement will inevitably lead to pavement network crack and subsidence under the action of traffic load. If the pavement has pits, subsidence, and cracks, the pavement smoothness will decline. The skid resistance of pavement will increase if the surface of the pavement is peeled off and there is surface pockmark. On the contrary, the skid resistance will decrease if the pavement is oily and smooth. Therefore, the analysis of the relationship between pavement damage and other three indicators can indirectly get the sections with more serious pavement damage, so as to conduct targeted investigation and detection, reduce the scope of pavement damage investigation, save a lot of manpower and material resources, and improve work efficiency.

The value range of PCI is 0–100. The bigger the value is, the better the road condition is.

Table 1   Standard for evaluating the technical condition of asphalt pavement

| Technical grade | Excellent | Good | Secondary | Bad | Defective |
| --- | --- | --- | --- | --- | --- |
| Technical status index of asphalt pavement | [90, 100) | [80, 90) | [70,80) | [60, 70) | (0,60) |

Data sources refer to “Technical Specification for Maintenance of Highway Asphalt Pavement”

This index converts the reverse index DR with smaller value and better value into the forward index with bigger value and better value, which accords with people s logical inertia. At the same time, it is easy to keep consistent with other positive indexes. Referring to the relevant provisions in Technical Specification for Maintenance of Highway Asphalt Pavement, the evaluation criteria for pavement damage are shown in Table 1.

For BP network, before the training sample is input network, the input and output data must be preprocessed: normalized scale transformation (also known as standardized processing) or distribution transformation. Normalized scale transformation of input and output data refers to the transformation process to limit the input and output data of the network to [0, 1] or [− 1, 1] intervals. It is a kind of linear transformation. It can only unify the change range of sample data, but cannot change the distribution of sample data. The commonly used transformations are $\begin{array} { r } { \bar { x } _ { i } = \frac { \bar { x } _ { i } - x _ { \mathrm { m i n } } } { x _ { \mathrm { m a x } } - x _ { \mathrm { m i n } } } } \end{array}$ and so on. The distribution transformation of input and output data is a nonlinear transformation. It is a transformation method that changes not only the change range of sample data, but also the distribution law of sample data when the sample distribution is unreasonable. Commonly used transformations include sigmoid transformation, logarithm transformation, square root transformation, cube root transformation, etc.

There are often some abnormal data in the measured data of pavement performance evaluation index. However, in theory and in practice, this kind of data does exist. In the previous processing, in order to reduce the impact of this kind of abnormal data, the method of eliminating these abnormal data is usually used. This method is unscientific, because these abnormal data do exist.

In view of the advantages of an artificial neural network prediction model in function approximation and data fitting, the most widely used BP neural network is used in this study to predict the performance of pavement, so as to provide a reasonable basis for the preventive maintenance decision making of pavement.

Because of the particularity of the road, there are many kinds of factors affecting the performance of asphalt pavement. The main factors affecting pavement

![](images/page_12_image_7.jpg)

Fig. 4   Influencing factors of pavement performance

<table><tr><td colspan="4">Table 2 Common models for prediction of asphalt pavement performance</td></tr><tr><td></td><td>Prediction model Model characteristics</td><td>Advantage</td><td>Shortcoming</td></tr><tr><td>Multivariate regressive method</td><td>A large amount of test data is needed as the basis</td><td>Simple and clear</td><td>Large amount of data and complex data process- ing</td></tr><tr><td>Grey theory</td><td>From the monitored data of pavement perfor- mance, some objective laws are found</td><td>It has a high accuracy for predicting the service condition of asphalt pavement in a short period of time</td><td>The accuracy of prediction of long-term use of asphalt pavement is low</td></tr><tr><td>Neural network</td><td>From the perspective of information process- ing, abstract simulation of human brain neural network is carried out by mathematical and physical methods</td><td>It has super high speed, fault-tolerant and toler- Calculation is complicated ance</td><td></td></tr><tr><td>Markov model</td><td>Markov chain theory is used to obtain the prob- ability that the system may reach a certain state in the future</td><td>It can objectively reflect the different road factors and organize to the new optimization process</td><td>The predicted pavement performance results of the model are not intuitive enough. The pre- dicted random fluctuation is large</td></tr></table>

performance are simply classified, as shown in Fig. 4. When establishing the predic tion model of pavement performance, the influence of traffic, engineering, climate, pavement characteristics, and other factors should be fully considered to determine the appropriate prediction model.

It can be seen from Table 2 above that when choosing different prediction models, they will be affected by many factors from the performance of asphalt pavement. For the experimental data collected from expressway and the actual road conditions of pavement performance, it is necessary to establish the prediction model within a certain range of use, so as to achieve the expected use effect and objectively reflect the law of road condition decay. For the multiple regression analysis method, the multi-linear and nonlinear fitting technology can better fit the decay law of the actual pavement performance, while the neural network model can still achieve high prediction results under the condition that the test data of the pavement performance is not sufficient, so it has high accuracy. In this study, combined with the development of expressway asphalt pavement and pavement conditions in recent years, neural network and regression analysis are reasonably used to establish a combined prediction model for asphalt pavement performance.

## 5  Discussion

Preventive maintenance model of highway mainly adopts four indicators: smoothness, rutting depth, crack rate, and anti-skid performance. Therefore, the prediction model should predict the above four indicators, but according to the existing data, only the pavement performance is predicted according to the rutting depth in this study.

The attributes of temperature, humidity, and traffic are as follows: CD indicates temperature attributes, and it is converted by daily maximum temperature. AW denotes humidity attributes, and it is expressed by precipitation. AADT denotes traffic attributes, and it is calculated by annual average traffic volume.

Based on the study of the relationship between permanent deformation and temperature at home and abroad, the concept of daily maximum temperature conversion days CD is proposed in this study, as follows:

$$
\mathrm { C D } = \sum _ { i = 1 } ^ { n _ { \mathrm { o } } } e ^ { a _ { \mathrm { o } } \left( T _ { \mathrm { i } } - T _ { \mathrm { o } } \right) }\tag{18}
$$

In the equation, the CD is the converted days when the daily maximum temperature is greater than $T _ { \mathrm { o } ^ { * } } n _ { \mathrm { o } }$ is the actual days when the daily maximum temperature is greater than $T _ { \mathrm { o } } ,   a _ { \mathrm { o } }$ is the regression coefficient, which is 0.07 in this study. $T _ { \mathrm { o } }$ is the highest atmospheric temperature in the base day, which is $3 0 \; ^ { \circ } \mathbf { C }$ in this study.

The sample of the prediction model is obtained by sorting out the actual values of the rutting influencing factors and the predicted values. The specific data are shown in Table 3.

The neural network is trained and predicted by the smoothing moving method, and the solution of the smoothing moving method is as follows. On the basis of not affecting historical data, in the whole {xt} $( t = 1 ,   2 , \ldots , N )$ , S data for predicting the impact variables are selected. Selected data should be nearest to time t, which can be expressed as $\left( x _ { t } ,   x _ { t - 1 } , \ldots   X _ { t - s } + 1 \right)$

Table 3   Measured and predicted values of attributes of influencing factors in rutting prediction

| Particular year | The first ye | ar The second y | ear The third ye | ar The fourth y | ear The fifth year |
| --- | --- | --- | --- | --- | --- |
| CD (day) | 86 | 63 | 87 | 95 | 94 |
| Accumulated Value | 86 | 150 | 237 | 332 | 426 |
| (days) |  |  |  |  |  |
| Predicted value (day) |  |  |  |  |  |
| AW (mm) | 388 | 659 | 240 | 334 | 305 |
| Accumulated value | 388 | 1047 | 1287 | 1621 | 1926 |
| (mm) |  |  |  |  |  |
| Predicted value (mm) |  |  |  |  | 1951 |
| AADT (*10<sup>4</sup>) | 1.20141 | 1.32426 | 1.47402 | 1.61163 | 1.77228 |
| Accumulated Value | 1.20141 | 2.52567 | 3.99969 | 5.61132 | 7.3836 |
| (10<sup>4</sup>) |  |  |  |  |  |
| Predicted value (10<sup>4</sup>) |  |  |  |  |  |

Data sources refer to “Technical Specification for Maintenance of Highway Asphalt Pavement”

In this study, the data of the past two years are selected for input, and the cumulative value of the third year is taken as output, and then, the values are taken sequentially. The following equation is the number of days converted to the highest temperature and constitutes the original matrix:

$$
\begin{aligned} &X = \begin{bmatrix} 86 & 150 237 \\ 150 237 332 \end{bmatrix}, \quad\\ &B = \begin{bmatrix} 237 332 426 \end{bmatrix}\\ \end{aligned}\tag{19}
$$

In the equation, X is the input matrix and B is the corresponding target output.

Because this study is about preventive maintenance of asphalt pavement, the corresponding database data are not very sufficient. In this study, the data of the first 2 years are input and the cumulative value of the third year is output. On the one hand, it is to predict future performance. On the other hand, it is to compare with the actual situation, and the prediction model matches well with the real data, which confirms the operability of the model selected in this study.

In order to simplify the process of solving the neural network model, the data can be quantified. The numerical value is between [0, 1]. The process of quantify ing the influencing factors is as follows:

Daily maximum temperature conversion days are:

$$
\mathrm { C D } ^ { ' } = \mathrm { C D } / \mathrm { C D } _ { \mathrm { m a x } }\tag{20}
$$

Annual precipitation is:

$$
\mathrm{AW}^{'} = \mathrm{AW} / \mathrm{AW}_{\max}\tag{21}
$$

The annual average daily traffic volume is:

$$
\mathrm { A A D T } ^ { ' } = \mathrm { A A D T } / \mathrm { A A D T } _ { \mathrm { m a x } }\tag{22}
$$

In the equation, $\mathrm{CD}_{\max}, \mathrm{AW}_{\max}$ and $\mathrm { A D T } _ { \mathrm { m a x } }$ are the cumulative maximum of the allowable range of the index, respectively. $\mathrm{CD}_{\max }=1000, \mathrm{AW}_{\max }=10,000,$ and $\mathrm{AADT}_{\max }=500,000$ . In order to simplify the solving process, the data can be processed quantitatively in the neural network system. If the value is between 0 and 1, 1000, 10,000, and 500,000 will be taken. Of course, any value can be taken, just to make the quantized coefficient between 0 and 1, which is convenient for calculation.

$$
\begin{aligned} &R_{1} = \begin{bmatrix} 0.0240\ 0.0415\ 0.0657 \\ 0.415\ 0.0657\ 0.0922 \end{bmatrix}\\ &R_{2} = \begin{bmatrix} 0.0657\ 0.0922\ 0.1620 \end{bmatrix}\\ \end{aligned}\tag{23}
$$

The representation of the input quantization matrix of CD value is shown in Eq. 20, and the output quantization matrix of CD value is shown in Eq. 24.

After quantifying the CD value, it is input into the neural network system for training and trial calculation. The number of hidden layer nodes is 8. The error is 1.9039e−006 after the system assigns the closed value and the network weight. The prediction error curve of CD value is shown in Fig. 5.

After quantifying the AW value, it is input into the neural network system for training and trial calculation. The number of hidden layer nodes is 11. The error is 4.1387e−007 after the system assigns the closed value and the network weight. The prediction error curve of AW is shown in Fig. 6.

![](images/page_16_chart_10.jpg)

Fig. 5   Prediction error curve of CD value

![](images/page_17_chart_2.jpg)

Fig. 6   Prediction error curve of AW value

![](images/page_17_chart_4.jpg)

Fig. 7   The prediction error curve of AADT value

After quantifying the AADT values, the AADT values are input into the neural network system for training and trial calculation. The number of hidden layer nodes is 19. The error is 2.4550e−006 after the system assigns the closed value and the network weight. The prediction error curve of the AADT is shown in Fig. 7.

BP network prediction model of pavement condition index (PCI) is established, and good results are obtained. However, this model needs to be improved. Firstly, deflection is directly used as an evaluation index in modeling. Even under the same natural environment and load conditions, the development and variation of deflection of different pavement structures will vary greatly. There are great limitations in using deflection directly as an evaluation index. Secondly, almost all of the PCI used in the model are above 90. The experimental samples do not cover the normal range of values and are not scientifically distributed. Thirdly, BP network is used in the model. Because BP network itself has the shortcomings of slow convergence and easy local convergence, the modeling of this model is difficult. Moreover, the most important index to test the validity of a model is its normalization ability. In this model, the validation of the model is not considered, and the normalization ability of the model is not explained. Using the model to simulate can preliminarily judge the damage situation of the road section, conduct targeted pavement damage investigation, reduce the scope of pavement damage investigation, save a lot of manpower and material resources, and improve work efficiency, which has high practical value.

Table 4   Correlation analysis between predicted data of BP network model and measured damage rate

<table><tr><td rowspan="2">Category</td><td rowspan="2">Training order</td><td colspan="5">Correlation between prediction data of BP network model and expert evaluation data</td></tr><tr><td>N</td><td>NNsse</td><td>Cor1</td><td>Cor2</td><td>Cor3</td></tr><tr><td rowspan="10">Training results of BP network with trainlm method</td><td>1</td><td>2000</td><td>0.273091</td><td>0.887</td><td>0.109</td><td>0.092</td></tr><tr><td>2</td><td>2000</td><td>0.295711</td><td>0.877</td><td>-0.063</td><td>0.063</td></tr><tr><td>3</td><td>2000</td><td>0.163974</td><td>0.934</td><td>0.408</td><td>0.876</td></tr><tr><td>4</td><td>2000</td><td>0.347599</td><td>0.853</td><td>0.546</td><td>0.810</td></tr><tr><td>5</td><td>2000</td><td>0.347286</td><td>0.853</td><td>0.283</td><td>0.704</td></tr><tr><td>6</td><td>2000</td><td>0.19729</td><td>0.902</td><td>0.428</td><td>0.830</td></tr><tr><td>7</td><td>2000</td><td>0.256324</td><td>0.920</td><td>0.200</td><td>0.517</td></tr><tr><td>8</td><td>2000</td><td>0.228597</td><td>0.906</td><td>0.145</td><td>0.457</td></tr><tr><td>9</td><td>2000</td><td>0.341037</td><td>0.856</td><td>0.133</td><td>0.415</td></tr><tr><td>10</td><td>2000</td><td>0.127158</td><td>0.949</td><td>0.377</td><td>0.525</td></tr><tr><td rowspan="10">Training results of BP network with trainBP method</td><td>1</td><td>2000</td><td>1.03577</td><td>0.435</td><td>0.247</td><td>0.414</td></tr><tr><td>2</td><td>2000</td><td>1.03515</td><td>0.435</td><td>0.277</td><td>0.419</td></tr><tr><td>3</td><td>2000</td><td>1.04868</td><td>0.423</td><td>0.321</td><td>0.413</td></tr><tr><td>4</td><td>2000</td><td>1.01735</td><td>0.452</td><td>0.253</td><td>0.427</td></tr><tr><td>5</td><td>2000</td><td>1.05133</td><td>0.420</td><td>0.273</td><td>0.406</td></tr><tr><td>6</td><td>2000</td><td>1.06564</td><td>0.407</td><td>0.204</td><td>0.385</td></tr><tr><td>7</td><td>2000</td><td>1.02534</td><td>0.444</td><td>0.354</td><td>0.436</td></tr><tr><td>8</td><td>2000</td><td>1.03778</td><td>0.433</td><td>0.250</td><td>0.413</td></tr><tr><td>9</td><td>2000</td><td>1.04343</td><td>0.428</td><td>0.244</td><td>0.408</td></tr><tr><td>10</td><td>2000</td><td>1.03356</td><td>0.437</td><td>0.348</td><td>0.429</td></tr></table>

trainlm indicates Levenberg–Marquardt training function; trainbp indicates BP algorithm training function (standard); NNsse indicates the error E output by the network when the NN algorithm ends; N indicates the number of iterations at the end of BP fine-tune training; and $\mathbf { C o r } _ { 1 / 2 / 3 }$ indicates the correlation coefficient between expert evaluation data and regression equation prediction data of one regression sample/test sample/all samples

The significance of establishing the prediction model of service performance after taking preventive maintenance measures is as follows. Firstly, life cycle cost analysis of various preventive maintenance measures is carried out. Secondly, concrete maintenance time and measures are determined. Thirdly, benefits comparison is made among different measures. Fourthly, data are provided for project sequencing and scheme optimization (Table 4).

Compared with the BP network with different training methods, the Cor1 of the network trained by trainlm method can be close to 0.9, while the Cor1 of the network trained by trainbp method cannot reach 0.5. The convergence rate of the former is obviously faster than that of the latter. Therefore, the trainlm training method based on Levenberg–Marquardt optimization method is adopted for BP network in the hybrid model. The relationship between PCI and other indexes is too complex, and there are many fuzzy and random factors. Too much pursuit of prediction accuracy will make the network concentrate all resources to fit the training samples, and at the same time, the network will make the structure larger, redundant resources appear, which will cause the instability of the network and reduce the generalization ability of the model.

As shown in Table 5, by selecting the appropriate combined prediction form and parameter settings, the combined prediction model can obtain a prediction result that is closer to the actual result. From the perspective of prediction evaluation values, the prediction errors of the three sets of combined prediction values are lower than the prediction errors of the single neural network and Markov prediction model, of which the weighted ratio average and the combined prediction model are the best.

## 6  Conclusions

In recent years, the state’ s investment in highway construction has been increasing, and highway construction represented by highway has made considerable progress. However, the construction of the highway is only the beginning of solving traffic problems. Faced with such a large scale of the highway, how to maintain and manage it scientifically and reasonably has become a thorny problem faced by highway maintenance and competent departments. Traditional subjective experience decision making will inevitably lead to unreasonable pavement maintenance schemes due to experience limitation in the decision-making process. Therefore, it is an inevitable choice for management departments to assist and guide highway maintenance management and decision making by means of advanced management and decisionmaking means. Based on the characteristics of highway pavement maintenance, a thorough and comprehensive study is made on the key issues of pavement performance evaluation, traffic volume prediction, performance prediction, and maintenance optimization decision making involved in highway asphalt pavement maintenance management. The results can effectively solve the decision-making problems of the current highway pavement maintenance management, improve the expressway operation and management level, reduce decision errors, improve decisionmaking level, reduce maintenance costs, improve maintenance quality, and bring significant economic and social benefit. An evaluation and prediction model of highway asphalt pavement performance based on bp neural network is presented in this study. According to the research in this study, the following conclusions are drawn.

Table 5   Comprehensive evaluation table of combined forecast effect

<table><tr><td rowspan="2">Forecast year</td><td colspan="3">Model prediction</td><td colspan="3">Error</td><td rowspan="2">Average error</td></tr><tr><td>2017</td><td>2018</td><td>2019</td><td>2017</td><td>2018</td><td>2019</td></tr><tr><td>Neural network model</td><td>74.7</td><td>70.3</td><td>64.4</td><td>0.0163</td><td>0.0131</td><td>-0.0092</td><td>0.0129</td></tr><tr><td>Markov model</td><td>74.5</td><td>70.6</td><td>65.8</td><td>0.0136</td><td>0.0173</td><td>0.0123</td><td>0.0144</td></tr><tr><td>Combined forecasting model of the weighted arithmetic average</td><td>73.67</td><td>70.44</td><td>65.03</td><td>0.0022</td><td>0.0149</td><td>0.0005</td><td>0.0102</td></tr><tr><td>Combined model of weighted square sum average</td><td>73.65</td><td>70.44</td><td>65.05</td><td>0.0021</td><td>0.0150</td><td>0.0007</td><td>0.0103</td></tr><tr><td>Forecasting model of weighted ratio average sum</td><td>74.61</td><td>1 70.43</td><td>65.01</td><td>0.0151</td><td>0.0148</td><td>0.0010</td><td>0.0100</td></tr></table>

In this study, the theoretical characteristics of neural network are analyzed, which proves that it can effectively solve the problems of insufficient data and inaccurate data in the evaluation of road performance. Moreover, the feasibility and necessity of its use are fully demonstrated. The neural network evaluation model established in this study takes the test data as the input data and outputs the evaluation results directly, which reduces the calculation error in the evaluation process of the intermediate single index, makes the final evaluation result more accurate and stricter, and the operation process simpler and more convenient. Therefore, the model established in this study is more suitable for the performance evaluation of highway asphalt pavement in China. A highway is different from other roads, because its performance decay mode is diverse, and there are many influencing factors. Pre-ventive maintenance measures should be selected after a more in-depth study of the causes of pavement damage. When establishing the evaluation index of preventive maintenance, vehicle, and environmental factors should be fully considered, and the classification criteria should be clearer. In this study, the factors affecting the performance of asphalt pavement are not comprehensive enough. In addition to traffic conditions, climate conditions, pavement structural layers, and raw materials, pavement structural maintenance conditions, the construction quality of asphalt pavement and asphalt mixture ratio should also be considered.

## References

1. Shi X, Hansen G, Mills M et  al (2016) Preserving the value of highway maintenance equipment against roadway deicers: a case study and preliminary cost benefit analysis. Anti-Corros Methods Mater 63(1):1–8

2. Zhao J, Fu X, Zhang Y (2016) Research on risk assessment and safety management of highway maintenance project. Procedia Eng 137:434–441

3. Wu D, Yuan C, Kumfer W et al (2016) A life-cycle optimization model using semi-Markov process for highway bridge maintenance. Appl Math Model 43:9

4. Liu Y, Wang Y, Dong A (2018) Life-cycle $\mathrm { C O } _ { 2 }$ emissions and influential factors for asphalt highway construction and maintenance activities in China. Int J Sustain Transp 12(6):1–13

5. France-Mensah J, O’Brien WJ, Khwaja N et al (2017) GIS-based visualization of integrated highway maintenance and construction planning: a case study of Fort Worth, Texas. Vis Eng 5(1):7

6. Hermawan, Suprapto M, Setyawan A (2017) The use of International Roughness Index and structural number for rehabilitation and maintenance policy of local highway. IOP Conf Ser Mater Sci Eng 176(1):012031

7. Lu Z, Qiang M (2018) Impacts of pavement deterioration and maintenance cost on Pareto-efficient contracts for highway franchising. Transp Res Part E Logist Transp Rev 113:1–21

8. Shah R, Mcmann O, Borthwick F (2017) Challenges and prospects of applying asset management principles to highway maintenance: a case study of the UK. Transp Res Part A 97:231–243

9. Fan X, Gao F, He T et al (2017) Establishment of an evaluation model for asphalt pavement preventive maintenance based on improved EW-AHP. J Highw Transp Res Dev (Engl Edn) 11(3):48–53

10. Seo J, Hatfield G, Kimn JH (2016) Probabilistic structural integrity evaluation of a highway steel bridge under unknown trucks. J Struct Integr Maint 1(2):65–72

11. Wheat P (2017) Scale, quality and efficiency in road maintenance: evidence for English local authorities. Transp Policy 59:46–53

12. Liu ZH, Wang XF, Sheng LI et al (2016) Influences of thermal and drying shrinkages on longitudinal reinforcement in continuously reinforced concrete pavement. China J Highw Transp 29(11):1–9

13. Abaza KA (2016) Back-calculation of transition probabilities for Markovian-based pavement performance prediction models. Int J Pavement Eng 17(3):253–264

14. Lee KWW, Wilson K, Hassan SA (2017) Prediction of performance and evaluation of flexible pavement rehabilitation strategies. J Traffic Transp Eng 4(2):178–184

15. Premkumar L, Vavrik WR (2016) Enhancing pavement performance prediction models for the Illinois Tollway System. Int J Pavement Res Technol 9(1):14–19

16. Yang YH, Jiang YH, Wang XC (2016) Pavement performance prediction methods and maintenance cost based on the structure load. Procedia Eng 137:41–48

17. Mazari M, Rodriguez DD (2016) Prediction of pavement roughness using a hybrid gene expression programming-neural network technique. J Traffic Transp Eng 3(5):448–455

18. Ozer H, Al-Qadi IL, Singhvi P et al (2018) Prediction of pavement fatigue cracking at an accelerated testing section using asphalt mixture performance tests. Int J Pavement Eng 19(3):264–278

19. Abaza KA (2016) Simplified staged-homogenous Markov model for flexible pavement performance prediction. Road Mater Pavement Des 17(2):17

20. Ghasemi P, Aslani M, Rollins DK et al (2019) Principal component analysis-based predictive modeling and optimization of permanent deformation in asphalt pavement: elimination of correlated inputs and extrapolation in modeling. Struct Multidiscip Optim 59(4):1335–1353

21. Ghanizadeh AR, Rahrovan M, Bafghi KB (2018) The effect of cement and reclaimed asphalt pavement on the mechanical properties of stabilized base via full-depth reclamation. Constr Build Mater 161:165–174

22. Zhao Y, Ying G, Yan S et al (2018) New method for making and selecting the compaction plan of asphalt pavement based on compaction quality and carbon emissions. J Clean Prod 181:385–398

23. Shirzad S, Aguirre MA, Bonilla L et  al (2018) Mechanistic-empirical pavement performance of asphalt mixtures with recycled asphalt shingles. Constr Build Mater 160:687–697

24. Chen Z, Wang H, Xu Y et  al (2018) A combinational prediction model for transverse crack of asphalt pavement. KSCE J Civ Eng 22(6):2109–2117

**Publisher’s Note** Springer Nature remains neutral with regard to jurisdictional claims in published maps and institutional affiliations.

## Affiliations

**Zhichen Wang**<strong><sup>1</sup></strong> **· Naisheng Guo**<strong><sup>1</sup></strong> **· Shuang Wang**<strong><sup>2</sup></strong> **· Yang Xu**<strong><sup>3</sup></strong>

Naisheng Guo naishengguo@dlmu.edu.cn

Shuang Wang 2014031002@chd.edu.cn

Yang Xu xyang2@mtu.edu

School of Transportation Engineering, Dalian Maritime University, Dalian 116026, Liaoning, China

2 School of Computer Science, Lyceum of the Philippines University, 4200 Batangas, Philippines

3 Department of Civil and Environmental Engineering, Michigan Technological University, Michigan, MI 49931, USA