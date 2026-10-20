<!--
SOURCE: 原始 PDF: reference/评估方法/Deng和Shi - 2023 - Modeling the rutting performance of asphalt pavements a review.pdf | 页数: 21 | 集合: reference
题录: litfull-111 Modeling the rutting performance of asphalt pavements: a review (DOI: 10.1186/s43065-023-00082-9)
提取: MinerU markdown 全文（可重建索引的真相源副本；images/ 不入 corpus）
-->
**REVIEW**

**Open Access**

# Modeling the rutting performance of asphalt pavements: a review

![](images/page_0_image_5.jpg)

Yong Deng<sup>1</sup> and Xianming Shi<sup>1\*</sup>

## Abstract

Rutting is a typical distress of asphalt pavement related to material, structural, loading, and environmental conditions of the pavement. This work presents a thorough and targeted synthesis of literature on current predictive models for rutting development in asphalt pavement, including the mechanical model, empirical model, machine learning model, and their combinations. By introducing and comparing the characteristics, advantages, and limitations of different model types, we focused on suitable approaches that predict rutting given the available information in the cor responding studies. Furthermore, we conducted a practitioner survey to identify performance deterioration models used by various highway agencies for asphalt pavement and to capture insights and experiences of users on the existing models in terms of reliability, precision, input and output parameters, consideration of maintenance and rehabilitation history, implementation considerations, etc. This review sheds light on the developing trend of predictive models for rutting and other distresses of asphalt pavement.

**Keywords** Asphalt pavement, Rutting, Regression model, Mechanistic-empirical model, Machine learning model

## Introduction

Asphalt pavement (a.k.a. flexible pavement) has been widely applied since the 1920s and is named for its surface layer, which is mainly constructed with aggregates and liquid asphalt binder. Currently, more than 90 percent of pavements in the U.S. are asphalt pavement, because of their durability, resilience, cost efficiency, and ecofriendliness [1]. Compared with rigid pavement, asphalt pavement features more flexibility due to  the viscous nature of asphalt binder, and partial energy from the traffic load can be dissipated through pavement deformation to resist fatigue damage to the pavement [2]. A properly designed and constructed asphalt pavement can typically last 15 to 20 years without total replacement. Asphalt pavement also features lower construction time and lower raw material cost than rigid pavement. Moreover, asphalt pavement can be largely recycled to serve as an additive to improve the stiffness of virgin pavement [3].

For longer service life and more cost-effective decisions, it is crucial to focus on the performance evaluation and prediction of asphalt pavement [4–7]. Currently, more than 1/3 of the annual highway budget is spent on maintenance and rehabilitation (M&R) of state and local roads in the U.S. [8]. Additionally, a pavement in good condition can benefit the safety and riding quality of the driving public. Asphalt pavement suffers from synthetic effects of the environmental and traffic loads [9]; as a multilayer structure made of composite materials, its distress mode and degree can vary with its material composition, structural configuration, and environmental and loading conditions. All these factors make the deterioration of asphalt pavement a complex and highly dynamic process [10].

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">Xianming.Shi@wsu.edu</span></small>

Cumulative efforts have been made to characterize deteriorations in asphalt pavement materials and structures. Accordingly, various models have been proposed for the deterioration evaluation and prediction in terms of individual distress modes or comprehensive performance of asphalt pavement. Table  1 lists representative national highway research programs in the U.S. in which performance models of asphalt pavement were proposed, modified, calibrated and/or validated. These major projects have been either funded by the Federal Highway Administration (FHWA) or belong to the National Cooperative Highway Research Program (NCHRP) and the Strategic Highway Research Program (SHRP). These projects typically include comprehensive information such as fundamental mechanisms of asphalt pavement distress modes, laboratory characterizations from the deterioration initiation, propagation to material failure, field calibrations of deterioration development models, and recommendations for pavement design, maintenance, and rehabilitation. Furthermore, the methodologies and models recorded in reports, articles, and standards capture the ideas, experience, and concerns of people in academia and industry on this topic.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">Xianming Shi</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">\*Correspondence:</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">1 Department of Civil and Environmental Engineering, National Center for Transportation Infrastructure Durability & Life‑Extension (TriDurLE), Washington State University, Pullman, Washington 99164, USA</span></small>

Table 1 indicates that rutting has gained wide and continuous attention among all typical individual distresses of asphalt pavement. Rutting results from permanent deformation of asphalt pavement layers under traffic and environmental excitations. As for the asphalt layer, rutting is considered to develop with a series of material rearrangement and deterioration under load repetitions at intermediate and high temperatures [11]. In addition to compromised life and performance of asphalt pavement (similar to other individual distresses), the specific negative impacts of rutting include moisture accumulation causing vehicle hydroplaning and surface unevenness causing higher fuel consumption and air and noise pollution [12]. As a result, characterization and prediction of rutting development in asphalt pavement are of vital importance from the economic, safety, and environmental aspects.

Despite recent advances in modeling rutting devel opment in asphalt pavement, the relevant information is scattered across various publications and there is a lack of synthesis of the published literature. Furthermore, there is the need to gauge the state of the practice by highway agencies in terms of their use of rut prediction models and their perception of emerging techniques. In this context, this review aims to gather relevant information on asphalt pavement performance models, mainly from the commonly used databases: Transport Research International Documentation Database, Google Scholar, and Web of Science, supplemented by a nationwide survey of practitioners. The main objectives of this review are to:

• describe the type, form, and parameters of current models for the asphalt pavement deterioration evaluation and prediction;

• introduce the application of current models in terms of their considerations of field conditions, accuracies, advantages, and limitations;

compare different model types in the asphalt pavement deterioration evaluation and prediction and summarize the trend and direction for the model evolution and future development.

## Model types

This section briefly introduces different types of models, including their histories, mechanisms, and applications. They are solely or jointly applied in the final models for the deterioration evaluation and prediction. Different model types not only reflect the interest and selection of researchers, but also reflect technology developments and engineering requirements.

## Mechanical models

Mechanical models treat asphalt mixture – the material of asphalt pavement surface – as a time- and ratedependent material [13]. It displays responses within four fundamental categories under external excitations: viscoelasticity, viscoplasticity, viscodamage, and microdamage healing [13]. All distress modes are representations of damages in the macro scale, which initiate from micro damages within the material [2]. Evidence includes the tertiary creep in the rutting test and post-peak behavior of the stress–strain response in the compressive strength test [2, 13, 14]. The test results can be better matched by introducing viscodamage models, which take actions from the initiation and propagation of microcracks in the previous stages.

Table  2 shows two examples of mechanical models coupling viscoelastic, viscoplastic, and viscodamage models to simulate asphalt mixture responses under external loads and at arbitrary temperatures [14, 15]. The apparent (measured) strain is decomposed into three components, of which each is associated with material properties, environmental and loading conditions, and classic mechanical theories. Mechanical models mainly require material properties and model coefficient values measured and calibrated from laboratory tests, respectively. Calibrated mechanical models can have desirable predictions over new sets of experimental data if the applied theories are sufficiently generalized and advanced [13–15].

The major limitation of mechanical models is their complexity. The stress state and environmental condition of a field pavement vary with time and location, which results in dynamic analysis and process. It would be difficult to achieve timely decision-making in the pavement maintenance and rehabilitation with such a time-consuming method. Currently, pure mechanical models are mainly applied in laboratory tests on asphalt mixture samples in which the environmental and loading conditions are simple and uniform.

Table 1 Representative national projects on asphalt pavement performance models

| Program | Year | Project Number | Distress Mode |
| --- | --- | --- | --- |
| FHWA | 1984 | FHWA RD-84-018 | • Fatigue damage · Rutting |
|  | 1998 | FHWA RD-98-132 | • Roughness |
|  | 2012 | FHWA HRT-11-045 | · Rutting • Fatigue cracking |
| NCHRP | 1986 | NCHRP 01-10 | · Rutting • Fatigue cracking |
|  | 1989 | NCHRP 10-26 | • Roughness ·Rutting |
|  | 1996 | NCHRP 01-31 | •Cracking • Roughness |
|  | 1998 2000 | NCHRP 01-36 | • Fatigue damage • Roughness |
|  |  | NCHRP 09-20 | · Rutting • Fatigue cracking |
|  | 2000 | NCHRP 10-48 | • Fatigue damage |
|  | 2003 | NCHRP 09-17 | · Rutting |
|  | 2004 | NCHRP 01-37 | • Bottom-up fatigue (or alligator) cracking • Surface-down fatigue (or longitudinal) cracking · Rutting ·Thermal cracking |
|  | 2005 | NCHRP 04-19(2) | · Rutting • Cracking (no model was built) |
|  | 2006 | NCHRP 09-19 | · Rutting |
|  | 2007 | NCHRP 09-34 | • Moisture damage (rutting and fatigue cracking served as indirect indicators) |
|  | 2009 | NCHRP 01-42 | • Top-down fatigue cracking |
|  | 2009 | NCHRP 09-38 | • Fatigue cracking |
|  | 2010 | NCHRP 01-41 | • Reflection cracking |
|  | 2011 | NCHRP 09-22 | · Rutting • Fatigue cracking •Thermal cracking |
|  | 2011 | NCHRP 09-33A | · Rutting • Fatigue cracking •Thermal cracking |
|  | 2012 | NCHRP 09-30A | · Rutting |
|  | 2013 2016 | NCHRP 09-44A | • Fatigue damage •Transverse cracking |
|  |  | NCHRP 09-49A | • Longitudinal cracking · Rutting |
| SHRP | 2018 | NCHRP 01-52 | • Top-down cracking • Fatigue cracking |
|  | 1993 | SHRP A-357 | · Rutting • Thermal cracking |
|  | 1994 | SHRP A-404 | • Fatigue damage |
|  | 1994 | SHRP A-415 | ·Rutting |

Numerical methods play an important role in mechanical models. For example, finite element (FE) is a typical numerical method providing numerical solutions for the governing equations (i.e., differential equations) that describe engineering problems [16]. The FE method solves the engineering problem of a complex system by dividing the system into finite elements. By solving the equation system assembled by all element equations to the original problem, the solutions at all element points can be obtained. For mechanical models of asphalt mixture as in Table 2, the FE model is typically built for the asphalt pavement of interest, and behaviors of the asphalt layer are defined with mechanical models. Commercial packages conducting FE analysis include ABAQUS, ANSYS and COMSOL [6, 7, 9, 14, 15, 17–19]. These packages provide a platform to couple multiple material models and solve complex equation systems. Currently, pavement FE model with the implementation of mechanical models of asphalt mixture is limited for the longterm rutting considering the computational time and storage space. Other numerical methods such as the discrete element method (DEM) that considers the mechanical nature of asphalt mixture are currently restricted in simulating laboratory and field tests on small-scale specimens as well due to the model assumption, computational time, and storage space [20–23].

## Empirical models

Empirical models are typically built with data on  pavement conditions other than material or structural responses. Pavement performance is associated with a given set of material properties, structural configuration, and loading and environmental conditions via regression analysis [1]. The advantages of empirical models, as opposed to mechanical models, are their simplicity of the model construction and explicit relations between pavement performance and these external factors. For example, Archilla and Madanat [24] first identified from extensive literature several factors affecting the rutting development in asphalt pavements, summarized as material properties, vehicle axles, thawing index, and load numbers. They then selected the exponential function from research on the rutting development in pavements, unbound granular materials, and natural soils. The exponential function can characterize the rutting development in the field road tests they studied. Finally, they specified values for model coefficients by performing statistical analysis. Recently, with the development of regression analysis, advanced model forms and regression approaches have been proposed. For example, a nonlinear mixed-effects model was applied in the evaluation and prediction of cracking progression in pavements [10].

Table 2 Examples of mechanical models for asphalt mixtures considering viscoelasticity, viscoplasticity, and viscodamage

<table><tr><td>Author</td><td>Component</td><td>Expression</td><td>Term Description</td></tr><tr><td rowspan="4"></td><td>Darabi et al. [15] Viscoelasticity</td><td colspan="2"> $\begin{array} { r } { \overline { { \varepsilon } } _ { i j } ^ { v e } = C ^ { 0 } ( \varGamma ) \overline { { \sigma } } _ { i j } + \int _ { 0 } ^ { \psi } \Delta C ( \psi ^ { t } - \psi ^ { \tau } ) \frac { d \overline { { \sigma } } _ { i j } } { d \tau } d t } \end{array}$ </td></tr><tr><td>Viscoplasticity</td><td colspan="2"> $\begin{array} { r } { \dot { \overline { { \varepsilon } } } _ { i j } ^ { v p } = \Gamma _ { 0 } ^ { v p } \vartheta ^ { v p } \Big \langle \frac { \overline { { \tau } } ^ { v p } - \alpha \overline { { I } } _ { 1 } - \overline { { R } } ( \overline { { p } } , \overline { { I } } ) } { \overline { { \tau } } ^ { v p } - \alpha \overline { { I } } } \Big \rangle ^ { N } \frac { \partial F } { \partial \overline { { \sigma } } _ { i j } } } \end{array}$ </td></tr><tr><td>Viscodamage</td><td> $\begin{array} { r } { \dot { \phi } = \Gamma ^ { v d } \left[ \frac { ( 1 - \phi ) ^ { 2 } \left\langle \overline { { \tau } } ^ { v d } - \alpha \bar { l } \right\rangle } { Y _ { 0 } } \right] ^ { q } \exp { ( k \overline { { \varepsilon } } _ { e f f } ) } \vartheta ^ { v d } } \end{array}$ </td><td>P - effective viscoplastic strain; F- viscoplastic potential function; N - viscoplastic rate sensitivity exponent.  $\overline { { \tau } } ^ { v d }   .$   $\Gamma ^ { v d }$  φ- damage density; - damage viscosity parameter; deviatoric stress in damaged state; Y0 - threshold damage force;</td></tr><tr><td rowspan="4">Zhang et al. [14] Viscoelasticity</td><td colspan="2"></td><td> $\vartheta ^ { v d }$   $; \overline { { \varepsilon } } _ { e \mathit { H } }   .$   $; k -$  q - material constant model parameter; - effective strain; - Arrhenius-type temperature term in damaged state.  $\varepsilon _ { k k } ^ { V e } -$   $e _ { i j } ^ { v e } \; .$  σij- stress tensor; viscoelastic volumetric strain; - viscoelastic deviatoric strain; K and G - relaxation bulk modulus ánd relaxation</td></tr><tr><td colspan="2"> $\begin{array} { r } { \sigma _ { i j } = \delta _ { i j } \int \limits _ { 0 } ^ { t } K ( t - \tau ) \frac { \partial \varepsilon _ { k k } ^ { v e } } { \partial \tau } d \tau + 2 \int \limits _ { 0 } ^ { t } G ( t - \tau ) \frac { \partial e _ { j j } ^ { v e } } { \partial \tau } d \tau } \end{array}$   $\begin{array} { r } { \dot { \varepsilon } _ { i j } ^ { v p } = \Gamma \langle \Phi ( f ) \rangle ^ { N } \frac { \partial g } { \partial \sigma _ { i j } } } \end{array}$  Viscoplasticity</td><td colspan="2"> $\delta _ { i j } - \mathsf { K } _ { 1 }$  shear modulus; ronecker delta.  $\dot { \varepsilon } _ { j j } ^ { v p } .$  - rate of viscoplastic strain with respect to time; T - viscosity  $; ^ { \prime } _ { f } -$  rélated parameter; N - viscoplastic rate dependent exponent</td></tr><tr><td colspan="3">Viscodamage</td><td colspan="2">viscoplastic yield function; g - viscoplastic potential function.  $\Delta J _ { R }$  rate of damage density with respect to time; - pseudo J-inte-</td></tr><tr><td colspan="3"></td><td colspan="2">gral per loading step; A and n - Paris&#x27;s law coefficients independent of loading mode, rate and temperature.</td></tr></table>

The major disadvantage of empirical models is the over-reliance of model coefficient values on the database for model calibration, which is common in data-driven models. As a result, the constructed empirical models can hardly characterize or predict performance of pavements of which any condition has changed. Moreover, considering the complexity of model structure and calibration algorithm, empirical models tend to have limited accuracy.

## Mechanistic‑empirical models

Mechanistic-empirical (ME) models are the widely applied models for pavement performance evaluation and prediction. They take advantage of the rationality and simplicity of mechanical empirical models. Pavement responses, mechanical theories, external factors, and statistical analysis are involved in ME models at different degrees. The idea of the ME approach can date back to the 1950s when the vertical compressive strain on the subgrade surface was used as an indicator for pavement rutting [1, 25]. This example presents the concept of “critical pavement response” that considers the failure criterion of a distress mode, and such a response is related to material properties, structural configuration, and environmental and loading conditions of the pavement.

Current progress in ME models is mainly recorded and implemented in the Mechanistic-Empirical Pavement Design Guide and the software AASHTOWare Pavement ME Design [26]. The procedures for using ME models to evaluate and predict pavement performance are pre-sented in Figure  1. Accordingly, required information to calibrate an ME model are shown in Figure 1 as well. Inputs and outputs can be found in the laboratory and field test results and databases such as the Long-Term Pavement Performance (LTPP) database. A pavement distress model typically includes three parts: the mathematical form characterizing the development of a distress mode; model parameters representing pavement responses, material properties, environmental and loading conditions; and model coefficients to be calibrated. As for pavement responses, either a layered elastic solution (JULEA) or the FE approach can be used according to the design guide [26] in which the previous one is a closed-form analytical solution predicting pavement responses at arbitrary locations.

![](images/page_4_image_4.jpg)

Fig. 1 Flow of pavement performance evaluation and prediction using mechanistic-empirical models (revised from [27])

As mechanical models, the pavement FE model can be built in packages introduced in Section 2.1 as well as those aimed for pavement analysis such as ELLIPAVE, MICHPAVE and EverStressFE. However, there are several differences between applications of FE methods in mechanical and ME models of pavement rutting. First, pavement responses required in ME models are typical elastic or linear viscoelastic responses. Second, packages such as ELLIPAVE and MICHPAVE simplify the pavement FE model in terms of the structure dimension and/ or load configuration. In general, representative pavement responses rather than true pavement responses are applied in ME models.

## Machine learning models

To treat pavement performance characterization and prediction as regression problems, machine learning (ML) models are relatively innovative, relative to empirical models. The quantitative relations between model input variables (pavement condition) and output variables (pavement performance) are constructed by sophisticated model structures and learning algorithms that can improve automatically through the data for model construction [28]. Figure 2 illustrates several artificial neural networks (ANNs), which are typical ML models inspired by the biological nervous system. The feedforward neural network (NN) in Fig. 2, as an example, is a multi-layered architecture including the input layer, hidden layer, and output layer. Each block or circle simulates a neuron in the human brain and each line represents the connection between neurons. The numbers of neurons in the input layer and output layer are determined by the specific problem – the numbers of outputs and associated influencing factors. The numbers of hidden layers and their contained neurons and the transfer function are selected by users. The feedforward NN adjusts the weight factor of each connection and the bias to the neuron in the model training and validation until the difference between the actual and predicted outputs drops below the threshold or the iteration number goes beyond the threshold. Meanwhile, recurrent neural network (RNN), deep belief network (DBN), fuzzy neural network (FNN), etc., as shown in Fig.  2 with modified model structures and learning algorithms, have been explored according to the types of the problem and data [29].

Decision tree is another ML model available for regression problems [31]. The space of input variables is split into multiple distinct and non-overlapping regions in which each output variable has one representative value (e.g. sample mean) as the prediction [32]. As shown in Fig. 3, the decision tree starts from the root node, which represents the whole data. In each decision node, the value of one input variable is tested as the decision maker. Accordingly, the values of output variable(s) are split until one leaf node with the prediction is reached [33]. In the model construction, the specific input variable and test criterion are selected for the decision node, which typically leads to the minimal difference between actual and predicted output values in the split according to evaluation metrics such as least squares (LS) and least absolute deviation (LAD) [34]. This procedure is recursively repeated until the stop criterion such as the maximum depth of the decision tree, minimum sample number per leaf node, etc. is satisfied.

![](images/page_5_image_2.jpg)

![](images/page_5_image_3.jpg)

(b)RNN with Self-Feedback at Hidden Layer

![](images/page_5_image_5.jpg)

(c) DBN

Fig. 2 Structures of typical ANN models [30]

![](images/page_5_image_8.jpg)

(d) FNN

![](images/page_5_image_12.jpg)

Fig. 3 Illustration of decision tree

As a generalization of the classification problem, the regression problem can be solved with support vector machine (SVM) and is referred to as support vector regression (SVR) [35]. A regression model expressed as Equation  1 is applied for the data fitting and prediction [36],

$$
f ( \mathbf { x } ) = \sum _ { i = 1 } ^ { I } \big ( a _ { i } - a _ { i } ^ { * } \big ) k ( \mathbf { x } _ { i } , \mathbf { x } ) + b ,\tag{1}
$$

where $\alpha _ { i }$ and $\alpha _ { i } ^ { * }$ are Lagrange multipliers; k is the kernel function for vector x<sub>i</sub> and x; b is the intercept;  I is the number of samples for model training. Compared with traditional regression models which train models by minimizing the differences between predicted and actual output values of all samples in the training dataset, SVR introduces the insensitive region within which the errors are not counted [35]. Accordingly, the model training is an optimization problem by maximizing the insensitive region while minimizing the errors of samples outside the insensitive region. Kernel function is applied to map the original sample features (i.e., inputs) to a higher dimension, which eases the capture of nonlinear patterns in the data.

In addition to the three types of models introduced above, ML models and algorithms such as k-nearest neighbors (KNN) can deal with rutting performance characterization and prediction as regression problems. However, essentially as data-driven models, quantity and quality of collected data for model training and validation significantly affect properties of the constructed ML models and their applicability [37–40]. Besides, the tradeoff between bias and variance affects model complexity and applied learning algorithms, which leads to potential problems such as underfitting (high bias and low variance) and overfitting (low bias and high variance). Specifically, ML models have limitations in dealing with engineering problems such that they are prone to provide implicit or even unreasonable relations between input and output variables.

## Probabilistic models

The models mentioned above can be categorized as deterministic models except that some ML models introduce the probabilistic framework to represent and manipulate uncertainty about models and predictions [41]. In contrast, probabilistic models provide a sequence of outputs with corresponding probabilities. Such models consider the dynamic nature of pavements in terms of the deterioration, environmental and loading conditions, and M&R histories [42]. Therefore, they are widely applied in predicting comprehensive indices for the pavement condition, such as the International Roughness Index (IRI). A representative probabilistic model in the pavement performance modeling is Markov Chain Process (MCP).

In MCP, the time history of the condition index is first divided into multiple condition states. The term transiting the condition index between condition states is called Transition Probability Matrix (TPM), expressed as Equation 2,

$$
\mathbf{P} = \begin{pmatrix}p_{11}^{t,t+1} p_{12}^{t,t+1} \cdots p_{1(n-1)}^{t,t+1} p_{1n}^{t,t+1} \\0 \quad p_{22}^{t,t+1} \cdots p_{2(n-1)}^{t,t+1} p_{2n}^{t,t+1} \\\vdots \quad 0 \quad \ddots p_{3(n-1)}^{t,t+1} \quad \vdots \\0 \quad 0 \quad \cdots \quad 0 \quad 1\end{pmatrix}\tag{2}
$$

in which

$$
\sum _ { j = 1 } ^ { n } p _ { i j } ^ { t , t + 1 } = 1 .\tag{3}
$$

where $p _ { i j } ^ { t , t + 1 }$ is the probability that the condition from i at state t to j at state t + 1, which is defined and calculated by users from collected pavement performance data [43]. In MCP, the transition probabilities are assumed constant and the current condition is only relied on the previous one. For example, the IRI at state t can be expressed in terms of its initial value as Equation 4 [42].

$$
\mathbf { I R I } _ { t } = \mathbf { P } \times \mathbf { I R I } _ { t - 1 } = \ldots = \mathbf { P } ^ { t } \times \mathbf { I R I } _ { 0 }\tag{4}
$$

MCP requires the user to have clear perceptions of the data and pavement condition to deal with tasks such as defining condition indices and partitioning condition time histories. The major limitations of probabilistic models are that they cannot provide explicit forms predicting continuous pavement condition with associated model parameters and time, and those stationary transition probabilities oversimplify the problem and cause systematic error. Such error accumulates in the state transition and reduces the prediction accuracy progressively.

## Models for rutting development

Rutting or permanent deformation in asphalt pavement occurs in both surface and supporting layers. This review introduces rutting in surface layers which are made of asphalt mixtures. Rutting typically accumulates at intermediate and high temperatures and under repetitive traffic loads [44]. The major laboratory test equipment characterizing rutting development in asphalt mixture samples (cylinders or slabs) include Asphalt Mixture Performance Tester (AMPT) [45], Hamburg Wheel Tracking Device (HWTD) [46], Asphalt Pavement Analyzer (APA) [47], Superpave Shear Tester (SST) [48], French Pavement Rutting Tester [49], Georgia Loaded Wheel

Tester [50], Vertically Loaded Wheel Tester (VLWT) [11, 51, 52], etc. In these tests, the samples are under either repetitive wheel loads or continuous haversine compressive loads. Temperature and load speed/cycle  remain constant during each test. The test results show the rutting development in asphalt mixtures share a typical shape as shown in Fig. 4. It can be divided into three distinctive stages based on the acceleration rate. Shape functions capturing the whole or partial curve were utilized in constructing empirical and ME models. Physical interpretations or hypotheses on the mechanisms of three stages contributed to the theory and parameter selection of mechanical, ME, and ML models.

## Mechanical models

According to mechanical models introduced in Section  2.1, the main contributor to rutting development in asphalt mixtures is viscoplastic strain. As shown in Table  2, the  fundamental components determining the initiation and development of viscoplastic strain are the yield surface function, potential function, and constitutive model [13]. The yield surface function, which is the same as potential function in associated viscoplastic models, determines the initiation, rate, and direction of viscoplastic strain [54]. It is related to material inherent properties (e.g., strength) and behaviors (e.g., workhardening) [2]. Typical yield surface models for asphalt mixtures include von Mises [55], Mohr–Coulomb [56], Drucker–Prager [57], and their modified versions [58]. The constitutive model is responsible for predicting material responses under various environmental and loading conditions based on fundamental mechanics and theories such as thermodynamics [13, 15, 59], energy balance [58, 60], arbitrary Lagrangian-Eulerian [61], etc.

As described before, current applications of mechanical models with comprehensive consideration of viscoelasticity, viscoplasticity, viscodamage, and micro-damage healing are limited to asphalt mixture samples. As for numerical methods (models) of asphalt pavements which are implemented with mechanical models of asphalt mixtures, mechanical models are typically simplified. Table 3 presents examples of asphalt pavement numerical models. It can be seen that:

• The  applied mechanical models of viscoplasticity include creep model, which is included in the material library of ABAQUS, and generalized Kelvin model, which typically characterizes viscoelastic materials. Initiation and accumulation of permanent strain rely more on time rather than stress state of the material and exist for the entire service life of the pavement. Characterizations of viscoplasticity as a damage mode of the material are not reflected in these models;

• The type, weight, and speed variations of traffic vehicles were rarely considered, which proved to signifi cantly affect the stress/strain state and rutting development [4, 11, 62]; and

• The  applications of proposed numerical models in rutting development prediction at a network level are

![](images/page_7_chart_10.jpg)

Fig. 4 Permanent strain and strain rate versus the number of loading cycles [53]

Table3Representative mechanical models for asphalt mixtures in asphalt pavements for rutting development

| Author | Numerical Models of Pavement and Mechanical Models of Material | Environmental and Loading Conditions | Results |
| --- | --- | --- | --- |
| Fang et al. [63] and Huang et al. [64] | • A 2D plane strain FE model [63] and a 3D FE model [64] were built in ABAQUS for pavements; • The creep strain rate was defined as ε = Aσⁿtm where σ is uniaxial equivalent deviatoric stress; t is loading time; and A, m and n are parameters obtained from creep | • The load was modeled as quasi-static load with a trans- verse distribution. Non-uniform contact stress and trans- verse wheel wander were considered [63]. • A step load was applied that lasted total time of the test loads [64]. | • A failure criterion was proposed based on the (deformed) pavement surface profile. Predicted failure mode of pave- ments matched field observations [63]; • Predicted rutting development had a reasonable degree of accuracy with measurements in an accelerated loading facility (ALF) test [64]. |
|  | • A 2D axisymmetric FE model was built in ABAQUS for the pavement; • The viscoplastic strain rate considering the time-temper- ature principle is εvp = Aτσn(#) m where σ is deviatoric stress; aτ is temperature shift factor | • The time interval of a vehicular load was calculated by Tp = a+b where is the size of mesh element; b is the tire footprint; and vh is the vehicle speed. • The temperature was measured in the test | Predicted rutting development matched well with tests in which the temperature and vehicle speed were constant. |
| Wu et al. [66] | tests. • A 2D axisymmetric FE model was built in ABAQUS for the pavement; • The material was modeled as elastoplastic in the first load cycle and linear elastic in the rest load cycles. The accumulated permanent strain at n-th cycle is dn−1 | • Constant tire pressures were used for different load lev- els. The field loading condition was modeled by an accel- erated analysis. The permanent deformation after N load cycles is PD(N) = PD(Nr)(x) B | Predicted rutting development needed to be shifted to match field measurements. Shift factors ranged from 0.8 to 1.6. |
|  | strength; h is hardening constant; É is loading modulus; and dn is ratio of unloading modulus to loading modulus at n-th cycle. • A 3D FE model was built in ABAQUS for the pavement; • A generalized Kelvin model was utilized for the asphalt mixture as | is obtained from laboratory tests; and N, is the reference number of load cycles; • The average temperature was utilized for the asphalt layer to calibrate layer modulus. It was measured in the field and adjusted every 25,000 load cycles. • The contact stress between the tire and pavement surface was decomposed into vertical and tangential stresses; and the movement of vehicular loads was simu- |  |

nmental and Loading Cond

dels of Mater Numerical Models of Pavement and Mechanical Models of Material

le 3 (continu

| Huang et al. [68] | • A pavement analysis framework was proposed in which pavement responses were provided by the layered elastic system and FE model; • Total rut depth was assumed to result from densification and shear flow as Rtotal(t), = ∫00 Rdens(t)dt + ∫0 εi(t)HAcdt where Rdens is the rut depth increment contributed by densification and only exists at the initial stage of the service life; ¿ is the rut depth increment contrib- uted by the plastic flow and exists during the whole service life; HAc is the thickness of the asphalt layer. Specifically, densification was assumed to correlate with the air void content ofin-place asphalt mixtures; and the initiation and evolution of plastic deformation were modeled by energy- and thermodynamics-based approaches proposed in the study. | • Field temperature profiles were obtained and utilized for all pavement sections; • Field traffic was represented by the equivalent single axle load (ESAL) with the effect of wheel wander consid- ered. | Stepwise rutting development was obtained and matched well with field measurements from the WesTrack test. |
| --- | --- | --- | --- |

not practical, due to their current performance and expenses of ABAQUS and similar tools.

To improve the efficiency of computation and analysis, a variety of techniques have been adopted by some numerical models, such as pavement geometry simplification [63], load equivalency [64, 65], and analysis acceleration [66]. These techniques provide convenience in implementing mechanical models, as complicated as in Table 2, into pavement numerical models. The models in Table 2 have been implemented into FE models of a slab in the wheel tracking test to compare different loading modes [69] and a pavement structure to conduct sensitivity analysis [70].

## Empirical models and mechanistic‑empirical models

Both empirical and ME models include shape functions characterizing entire (Stage I+II+III) or partial (Stage I+II) curve of the rutting development such as polynomial, exponential, and multi-staged functions. Compared with mechanical and numerical models, empirial and ME models can consider and incorporate  realistic and precise environmental and loading conditions more conveniently.

Table  4 introduces empirical and ME models with either representative forms, parameters, or procedures to process field conditions. The fundamental discrepancy between empirical and ME models is that empirical models ignore the role of pavement structure as a system that responds and deteriorates according to external environmental and loading conditions. Asphalt layers of asphalt pavements do not deteriorate as asphalt mixture samples in the laboratory. Therefore, the  material properties utilized for the empirical model calibration [71–76] may have different effects on different pavement structures. Some structural parameters were considered in empiri cal models, such as the layer thickness [24], layer depth [76], and stress state [76, 77]; the first two are too general and the last one proved to be more affected by the loading condition [11].

The pavement responses included in ME models were either measured [83] or calculated [11, 26, 74, 81]. In fact, the introduction of the “mechanistic” part contributes to the “empirical” part as well. A recent study [11] pointed out that the introduction of pavement responses reduced the dependency of rest regression parameters since pavement responses changed accordingly with environmental and loading conditions. Therefore, a highly nondeterministic regression analysis for traditional empirical models can be simplified.

To account for the dynamic nature of field temperature and traffic load, the service time of the pavement was partitioned. Temperatures were averaged [76] or represented by extreme ones [24]; and traffic load was categorized [24, 83] or converted to the standard one [72, 74, 75]. Moreover, a statistical model for the wheel wander was considered for a more representative loading condition as the field [26]. The accumulated rut depth required transfer to the current time period, which is also a method considering the dynamic nature of field conditions [26, 76].

Improvements for empirical and ME models can be made on modeling the variation of traffic load speed for the increasing consideration of viscoelastic models for the asphalt layer [11, 26]. Pavement deterioration models can also be implemented into ME models to achieve more representative pavement responses.

## Machine learning models

Construction of an ML model for rutting development includes collection and organization of material, structure, traffic, environment, and pavement performance (i.e., rut depth) data for representative model inputs and outputs. As mentioned in Section  2.4, the selection of ML model structures and learning algorithms, according to the requirements and characteristics of the problem and data, is important. Currently there is no significant difference between applications of ML models in rutting and other distress or for asphalt mixtures in the laboratory and asphalt pavements in the field.

Alharbi [87] applied an NN with one hidden layer to predict rutting index from pavement age, thickness, average temperatures, etc. Compared with linear regression models, trained NN improved the prediction accuracy (R<sup>2</sup>) by 75.61%. Gong et al. [88] applied two NNs to compare predicted total rut depth with the transfer function in the Pavement ME Design Guide [26]. The first NN applied one hidden layer and individual rut depth in the AC layer, base layer, and subgrade as inputs. The second NN had two hidden layers and used additional 18 material, structural, environmental, traffic and time parameters as inputs. In comparison, two linear regression models were built with identical inputs as NNs to represent the transfer function in the Pavement ME Design Guide. The two applied NNs improved the prediction accuracy (R<sup>2</sup>) by 22% and 88%. Moreover, by using the random forest algorithm, the relevancy of each input to the total rut depth was measured and ranked. Amin and Ajakaiye [89] applied an NN with two hidden layers to predict maximum rut depth from the information of traffic, climate, time and pavement surface condition and profile. A total of 638 road segments were utilized and contributions of all inputs were evaluated by sensitivity analysis. Haddad et  al. [90] tuned the hyperparameters and determined an NN with three hidden layers to pre-dict rut depth from 29 selected input variables. Using

| Model Type | Shape | Author | Model Form | Loading and Environmental Conditions |
| --- | --- | --- | --- | --- |
|  |  | ARA-ERES [26] | • The relation between the permanent strain and resilient strain derived from the laboratory test and was modified for the field: εr = βr110−3.15552T1.734βr2N0.39937βr3 where εp is the permanent strain; εr is the resilient strain; T is the temperature; Nis the number of load repetitions; βr1, βr2, and βr3 are calibration factors; | • The resilient strain is calculated from the layered elastic solution: εr = [E] (σz − µσx − µσy) where E*\|is the dynamic modulus magnitude of asphalt mixtures; μ is Poisson's ratio; σz, σx and σy are stresses at vertical and other two directions at a given depth; • Rutting development has different curves according to the temperature and stress/strain state of the evaluation |
|  |  | Yong et al. [11] | where εp is the permanent strain at i-th sublayer; ∆h is the thickness of i-th sublayer. The relation between the permanent strain and resilient strain was proposed for unbound granular materials [85] and extended to asphalt mixtures: = γ∞ × e−(x) (ym(41)ⁿ where εp(N) is the permanent strain at load repetition N; εr | This model was utilized in a VLWT test on multi-layered asphalt mixture structures in which the environmental and loading conditions were constant |
|  | Three-Stage Yong et al. [11] | model parameters. | tensor and the second invariant of the deviatoric stress tensor; Pa is atmosphere pressure; γ∞, ρ, β, m, n, K and N0 are derived from a three-stage empirical model for the HWTT test mixture structures in which the environmental and loading | The relation between the permanent strain and resilient strain This model was utilized in a VLWT test on multi-layered asphalt |
|  |  | εr: | [86] and was modified by introducing the structural response E = (n( N)−-1B where εp(N) is the permanent strain at load repetition N; εr | conditions were constant. |

5558 and 1388 datapoints as the training and testing datasets, much higher accuracy was achieved with NN $( R ^ { 2 } { = } 0 . 9 4$ and 0.82) than the one with linear regression model $( R ^ { 2 } { = } 0 . 2 8 )$ . Deng and Shi [39] applied an NN with one hidden layer to predict rut depth with corresponding pavement condition for the state of Idaho. Particle swarm optimization (PSO) was utilized to calibrate model coefficients, i.e., weights and biases of artificial neurons. Moreover, this study investigated the relationships between the model accuracy and updating efficiency and the number of calibrated parameters. The authors found that an optimum number of hidden neurons may exist to balance the tradeoff between model accuracy and reproducibility with limited computation time [39].

Examples introduced above features the architecture of feedforward NN. Recurrent neural network (RNN) is a descendant of feedforward NN and each neuron in the hidden layer(s) of RNN can send produced output to itself. In the time scale, a neuron at each time step is triggered by the output from the previous step and the input for this step [91]. Obviously, RNN is suitable for modeling time series data since they can remember and pass information through time [92]. Okuda et al. [92] and Choi and Do [93] trained RNNs to predict rut depth from time-series data of traffic, climate, and inspection history. Good agreements were achieved between predicted and measured rut depths.

Deng and Shi [40] applied gene expression programming (GEP) in determining both the form and parameter values of predictive models for distress development in asphalt pavement (including rutting). The authors developed the  GEP on the basis of genetic algorithm (GA) and genetic programming (GP), in which variables, constants, and arithmetic and logic operators are treated as elements of the gene and experience mutation, crossover and selection similar to those in natural selection [94]. As an ML model, GEP addressed the issue of model form being implicit. However, GEP would produce a model violating the deterioration mechanism of asphalt pavement when the training dataset contained outliers.

Liu et al. [95] compared four ML models: feedforward NN, SVR, random forest (RF), and gradient boosting (GB) in predicting rut depth of asphalt pavements in the LTPP database in which RF and GB are ensemble learning algorithms applied with decision trees. RF eventually aggregates predictions from individual trees constructed with random subsets of data [96] and GB incrementally corrects predictions from the previously constructed tree with a newly constructed tree. In addition to RF and GB, available ensemble learning algorithms include adaptive boosting, extreme gradient boosting, etc., and their applications and comparison can be found in a comprehensive study on predicting rut depth in asphalt mixtures [97]. In Liu et  al.’s work [95], 27 input variables were utilized to predict rut depth in asphalt pavements in the LTPP database. Four applied ML models achieved higher accuracy with $\mathbb { R } ^ { 2 }$ values around 0.90 compared with linear regression model with $\mathbb { R } ^ { 2 }$ value around 0.57.

## Summary

The characteristics of major models applied for characterizing and predicting rutting development in asphalt pavements are presented in Fig. 5. Compared with empirical models, mechanical models  feature higher versatility by utilizing general models and criteria describing the behaviors, damages, and failures of materials and structures. They were developed based on a solid foundation of classic theories and numerous validations, which include the conditions of field asphalt pavements. As for empirical models, their  model accuracy can be negatively affected by predicting pavements with conditions outside the dataset for model training. However, due to the dynamic nature of field condition in time and location, mechanical models should be repetitively called to conduct the procedures from determining the material state to calculating the pavement damage. The required computational time and model complexity limit the application of mechanical models in practical use. To achieve a balance between these two model types, ME models were developed by introducing pavement responses and/or simplified mechanical theories and criteria; and this should extend the model application since the values of these terms rely on the pavement internal (material and structure) and external (load and environment) conditions.

![](images/page_14_image_9.jpg)

Fig. 5 Characteristics and connections of asphalt pavement rutting models

Compared with empirical models, ML models offer higher fitting and prediction accuracies by adopting sophisticated model structures and calibration algorithms. However, the relations between pavement performance (i.e., rut depth) and influential factors described by the model tend to be implicit with the increase of model complexity. The corresponding disadvantages are  as follows. First, the relations are difficult to check and can be irrational due to overfitting. Second, adding or replacing data for model training are always accompanied by the hyperparameter tuning to ensure the best model performance, which may be an obstacle for some users. ML models with explicit forms such as NNs with shallow structures and GEP may be an option to leverage the benefits of both empirical models and ML models.

As for the connection between mechanical models and ML models, currently mechanical information primarily serves in the pre-processing and post-analysis of the ML modeling framework, such as feature selection and final model determination. Potential improvements can be made on using ML algorithms to effectively solve mechanical models or implementing physics-guided modeling techniques into ML model construction similar to those in solving partial differential equations [98].

## State of the practice: results from the nationwide survey

A practitioner survey was designed to identify performance deterioration models used by various highway agencies in the United States for asphalt pavements and to capture the insights and experiences of users on the existing models in terms of reliability, precision, input and output parameters, consideration of M&R history, implementation considerations, etc. The survey instrument was distributed to listservs such as Pav\_Net and TriDurLE\_Communications as well as selected state departments of transportation (DOTs). The complete version of the survey is provided in the Supplementary Information. Table 5 presents a summary of the technical questions asked in the survey. The survey was delivered online via the platform Qualtrics® during March to May

Table 5 Summary of technical questions in the survey

| Questionnaire topics |
| --- |
| • Specific distresses concerned in the applied models. (Q1) |
| • Resources of applied models. (Q2) |
| • Limitations of applied models. (Q3) |
| • Inputs of applied models including the name, difficulties in the usage, etc. (Q4-Q10) |
| • Purposes of the applied models. (Q11-Q13) |
| • Performance of the applied models. (Q14-Q19) |
| • Management of the applied models including the quality check, improvements, etc. (Q20-Q21) |
| • Expectations of applied models. (Q22-Q23) |
| • Opinions on the artificial intelligence models (Q24-Q25) |

2021 and there was a total of 43 effective responses collected from 23 states of the United States.

The survey revealed that rutting (15.7%) was among the five distresses concerned most by the researchers and technicians in state DOTs out of a total of 166 choice counts. Currently, the tools developed or purchased by individual agencies are the most popular choices for the pavement distress development prediction and management. Those tools include professional statistical packages such as R, business analytics services such as Power BI, and basic data visualization and analysis tools such as Excel spreadsheet, etc. The software built upon the AASHTO mechanistic-empirical (ME) pavement design guide - AASHTOWare Pavement ME Design ranked second (26.3%) in the survey out of a total of 38 choice counts. Considering the variety of applied tools, their limitations provided by the participants are quite scattered, from data quality to software update.

This survey also asked questions about model inputs. Following the mainstream predictive models such as the ME models, the model inputs were divided into four categories: traffic, climate, material, and structure. Figure 6 shows their necessities in the predictive models and difficulties to be obtained according to the user experience of the participants from 71 and 33 choice counts, respectively. The collective user experience indicates that the traffic information was more difficult to be obtained than the climatic information because of the lack of the traffic monitoring system (TMS) in certain areas. In comparison, climate data are more accessible from national weather databases and services. It was interesting to notice that the information on pavement structures and materials was believed to be important and necessary in the predictive models, yet a portion of the participants reported that variables of these two categorizes were not considered in the models or systems they currently applied. For those variables which are difficult to be obtained, the typical solutions include referring to recommended values in the systems, papers and reports, and using models without them.

![](images/page_16_chart_2.jpg)

Fig. 6 Information of four major model inputs

According to the survey responses, the main purpose of using these predictive models was to obtain distress indices for the pavement management. Therefore, the applied predictive models were expected with high qualities. Figure 7 shows the top five qualities of a good pre-dictive model voted and ranked by the participants out of a total of 25 choice counts. It can be summarized that the accuracy, complexity, and applicability are most concerning for those model users. Specifically, 80 percent of the participants expected the predictive models with the accuracy (R<sup>2</sup>) over 0.80. Nearly 50 percent of the participants believed that the main factor causing the poor predictions was the limited data for the model calibration. The solutions they could think of included increasing data amount for the mode construction and the frequency of the model validation, performing outlier reviews, etc. As for the model reliability and ruggedness, they were proposed based on the experience of the participants in obtaining very different predictions in pavements with similar conditions.

The survey asked questions specifically on the artificial intelligence (AI) models (traditional ML & DL models) because these are emerging and promising choices for pavement performance prediction. Responses of the participants on the knowledge of and attitude towards the AI models are presented in Fig. 8. More than 90 percent of the participants did not use

![](images/page_16_chart_8.jpg)

Fig. 7 Top five model qualities

![](images/page_17_chart_2.jpg)

![](images/page_17_chart_3.jpg)

Fig. 8 Responses of the participants on the AI models (a) knowledge and (b) attitude

AI models as the predictive models and half of the participants had no idea what the AI models were out of a total of 25 choice counts. However, it is promising that 32 percent of the participants showed interest in using AI models as their predictive models and 64 percent of the participants were willing to try after comparing with traditional models, out of a total of 25 choice counts. Therefore, it is worthwhile to develop and promote AI models as the predictive models for pavement distresses.

## Conclusions and recommendations

In this study, a literature review on current predictive models of asphalt pavement performance was conducted. Specifically, we used rutting development as an example to compare different model types. We also conducted and analyzed a practitioner survey to capture the insights and experiences on the existing models by users at various U.S. highway agencies. The main findings in this study can be summarized as follows.

Mechanical model can have desirable prediction performance given that the applied theories are sufficiently generalized and advanced. Due to its complexity and time consumption, however, the mechanical model has limited applications in predicting the long-term performance of field pavement sections.

Empirical model has advantages such as simplicity of the model construction and explicit relations between pavement performance and influencing factors. However, the empirical model has restricted applications for cases outside the training dataset due to the over-reliance of model coefficient values.

• Mechanistic-empirical model takes advantages of the mechanical model and empirical model with basic accuracy, rationality, and simplicity. Such a model considers the pavement conditions and responses in a mechanistic manner.

Machine learning model takes advantage of artificial intelligence and has sophisticated model structures and operations. Such a model can efficiently and automatically capture the quantitative relations between pavement performance and influencing factors. However, it has potential issues of overfitting, and similar to the empirical model, it has restricted applications for cases outside the training dataset.

Finally, according to the characteristics of different model types and expectations in model properties by practitioners, future research should focus on the models benefiting from model combinations such as ML models with explicit forms, mechanical models solving by ML algorithms, and physics-guided ML models.

## Supplementary Information

The online version contains supplementary material available at [https://doi.org/10.1186/s43065-023-00082-9](https://doi.org/10.1186/s43065-023-00082-9).

**Additional file 1:** Complete Version of the Practitioner Survey.

## Authors’ contributions

Y.D.: literature collection, writing of the draft manuscript; X.S.: funding, conceptualization, editing of final manuscript. Both authors reviewed the manuscript.

## Funding

This work was financially supported by the ITD (Project Number 293) and National Center for Transportation Infrastructure Durability & Life-Extension (TriDurLE).

## Availability of data and materials

The data will be made available upon reasonable request and approval by the ITD.

## Declarations

**Ethics approval and consent to participate** Not applicable.

## Competing interests

The authors declare no competing interests other than X. Shi is the Editor-in chief of Journal of Infrastructure Preservation and Resilience.

Received: 13 December 2022 Revised: 27 April 2023 Accepted: 30 May 2023

Published online: 28 July 2023

## References

1. Huang YH (2004) Pavement analysis and design, 2nd edn. Pearson Education Inc, Upper Saddle River, NJ

2. Lytton RL (2000) Characterizing asphalt pavements for performance. Transp Res Rec 1723(1):5–16

3. Luo X, Gu F, Zhang Y, Lytton RL, Birgisson B (2018) Kinetics-based aging evaluation of in-service recycled asphalt pavement. J Clean Prod 200:934–944

4. Deng Y, Luo X, Gu F, Zhang Y, Lytton RL (2019) 3D simulation of deflection basin of pavements under high-speed moving loads. Constr Build Mater 226:868–878

5. Deng Y, Luo X, Zhang Y, Lytton RL (2021) Evaluation of flexible pavement deterioration conditions using deflection profiles under moving loads. Transp Geotech 26:100434

6. Deng Y, Luo X, Wang H (2022) Backcalculation of damage density of in-service asphalt pavements using artificial intelligence-based finite element model updating. Fatigue Fract Eng Mat Struct 45(3):671–686

7. Deng Y, Luo X, Zhang Y, Cai S, Huang K, Shi X, Lytton RL (2021) Determination of flexible pavement deterioration conditions using Long-Term Pavement Performance database and artificial intelligence-based finite element model updating. Struct Control Health Monit 28(2):e2671

8. Juang C, Amirkhanian S (1992) Unified pavement distress index for managing flexible pavements. J Transp Eng 118(5):686–699

9. Deng Y, Luo X, Zhang Y, Lytton RL (2020) Determination of complex modulus gradients of flexible pavements using falling weight deflectometer and artificial intelligence. Mate Struct 53(4):1–17

10. Khraibani H, Lorino T, Lepert P, Marion J-M (2012) Nonlinear mixed-effects model for the evaluation and prediction of pavement deterioration. J Transp Eng 138(2):149–156

11. Deng Y, Zhang Y, Shi X, Hou S, Lytton RL (2022) Stress–strain dependent rutting prediction models for multi-layer structures of asphalt mixtures. Int J Pavement Eng 23(8):2728–2745

12. Lepert P, Brillet F (2009) The overall effects of road works on global warming gas emissions. Transp Res Part D Transp Environ 14(8):576–584

13. Al-Rub RKA, Darabi MK (2012) A thermodynamic framework for constitutive modeling of time-and rate-dependent materials Part I: Theory. Int J Plast 34:61–92

14. Zhang Y, Gu F, Birgisson B, Lytton RL (2017) Viscoelasticplastic-Fracture Modeling of Asphalt Mixtures under Monotonic and Repeated Loads. Transportation Research Record 2631(1):20–29

15. Darabi MK, Al-Rub RKA, Masad EA, Little DN (2012) Thermodynamicbased model for coupling temperature-dependent viscoelastic, viscoplastic, and viscodamage constitutive behavior of asphalt mixtures. Int J Numer Anal Methods Geomechanics 36(7):817–854

16. Reddy JN (2019) Introduction to the Finite Element Method, 4th edn. McGraw-Hill Education, New York, NY

17. Ling M, Deng Y, Zhang Y, Luo X, Lytton RL (2020) Evaluation of complex Poisson’s ratio of aged asphalt field cores using direct tension test and finite element simulation. Construction and Building Materials 261:120329

18. Deng Y, Shi X, Zhang Y, Chen J (2023) Numerical modelling of rutting performance of asphalt concrete pavement containing phase change material. Eng Comput 39:1167–1182

19. Deng Y, Shi X, Kou Y, Chen J, Shi Q (2022) Optimized design of asphalt concrete pavement containing phase change materials based on rutting performance. J Clean Prod 380:134787

20. Peng B (2014) Discrete element method (DEM) contact models applied to pavement simulation, Virginia Tech

21. Ma T, Zhang D, Zhang Y, Hong J (2016) Micromechanical response of aggregate skeleton within asphalt mixture based on virtual simulation of wheel tracking test. Construct Build Mater 111:153–163

22. Ma T, Zhang D, Zhang Y, Zhao Y, Huang X (2016) Effect of air voids on the high-temperature creep behavior of asphalt mixture based on threedimensional discrete element modeling. Mater Des 89:304–313

23. Zhang Y, Ma T, Ding X, Chen T, Huang X, Xu G (2018) Impacts of air-void structures on the rutting tests of asphalt concrete based on discretized emulation. Construct Build Mater 166:334–344

24. Archilla AR, Madanat S (2000) Development of a pavement rutting model from experimental data. J Transp Eng 126(4):291–299

25. Kerkhoven RE, Dormon GM (1954) Some considerations on the California bearing ratio method for the design of flexible pavements, 2nd edn. Shell Research Centre, London

26. ARA-ERES (2004) Guide for mechanistic–empirical design of new and rehabilitated pavement structures, National Copperative Highway Research Program, Transportation Research Board. National Research Council, Washington, D.C

27. Lytton RL, Luo X, Ling M, Chen Y, Hu S, Gu F (2018) A Mechanistic-Empirical Model for Top-Down Cracking of Asphalt Pavements Layers. Texas A&M Transportation Institute, Washington, DC

28. Mitchell TM, Carbonell JG, Michalski RS (2012) Machine learning: a guide to current research. Springer New York, NY

29. Deng Y, Chen C, Shi X (2022) Prediction of Traffic Mobility Based on Historical Data and Machine Learning Approaches. Washington State University, Pullman, WA

30. Do LN, Taherifar N, Vu HL (2019) Survey of neural network-based models for short-term traffic state prediction. Wiley Interdiscip Rev Data Min Knowl Disc 9(1):e1285

31. Breiman L (1984) Classification and Regression Trees, 1st edn. Routledge, New York, NY

32. James G, Witten D, Hastie T, Tibshirani R (2013) An Introduction to Statistical Learning, 2nd edn. Springer Nature, New York, NY, USA

33. Gong H, Sun Y, Shu X, Huang B (2018) Use of random forests regression for predicting IRI of asphalt pavements. Construct Build Mater 189:890–897

34. Wu X, Kumar V, Ross Quinlan J, Ghosh J, Yang Q, Motoda H, McLachlan GJ, Ng A, Liu B, Yu PS, Zhou ZH (2008) Top 10 algorithms in data mining. Knowl Inf Syst 14:1–37

35. Awad M, Khanna R, Awad M, Khanna R (2015) Support vector regression. Apress, Berkeley, CA, Efficient Learning Machines, pp 67–80

36. Smola AJ, Schölkopf B (2004) A tutorial on support vector regression. Stat Comput 14:199–222

37. Hossain M, Gopisetti L, Miah M (2017) Prediction of international roughness index of flexible pavements from climate and traffic data using artificial neural network modeling. Airfield and highway pavements 2017. pp 256–267

38. Ceylan H, Bayrak MB, Gopalakrishnan K (2014) Neural networks applications in pavement engineering: a recent survey. Int J Pavement Res Technol 7(6):434–444

39. Deng Y, Shi X (2022) An accurate, reproducible and robust model to pre-dict the rutting of asphalt pavement: neural networks coupled with particle swarm optimization. IEEE Intell Transp Syst Trans 23(11):22063–22072

40. Deng Y, Shi X (2022) Development of predictive models of asphalt pavement distresses in Idaho through gene expression programming. Neural Comput Appl 34:14913–14927

41. Ghahramani Z (2015) Probabilistic machine learning and artificial intelligence. Nature 521(7553):452–459

42. Alimoradi S, Golroo A, Asgharzadeh SM (2022) Development of pavement roughness master curves using Markov Chain. Int J Pavement Eng 23(2):453–463

43. Yang J, Lu JJ, Gunaratne M, Dietrich B (2006) Modeling crack deterioration of flexible pavements: Comparison of recurrent Markov chains and artificial neural networks. Transp Res Rec 1974(1):18–25

44. Tseng K-H, Lytton RL (1989) Prediction of permanent deformation in flexible pavement materials. In: Schreuders H, Marek C (eds) Implication of aggregates in the design, construction, and performance of flexible pavements. ASTM International, West Conshohocken, PA, pp 154–172

45. Dongré R, D’Angelo J, Copeland A (2009) Refinement of flow number as determined by asphalt mixture performance tester: Use in routine quality control–quality assurance practice. Transp Res Rec 2127(1):127–136

46. Lu Q, Harvey JT (2006) Evaluation of Hamburg wheel-tracking device test with laboratory and field performance data. Transp Res Rec 1970(1):25–44 47. Kandhal PS, Cooley LA (2003) Accelerated laboratory rutting tests: Evaluation of the asphalt pavement analyzer. Transportation Research Board, Washington, DC

48. Shenoy A, Romero P (2001) Superpave shear tester as a simple standardized measure to evaluate aggregate-asphalt mixture performance. J Test Eval 29(5):472–484

49. Romero P, Stuart K (1998) Evaluating accelerated rut testers. Public Roads 62(1):50–54

50. Shami HI, Lai JS, D’angelo JA, Harman TP (1997) Development of temperature-effect model for predicting rutting of asphalt mixtures using Georgia loaded wheel tester. Transp Res Rec 1590(1):17–22

51. Hou S, Shi X, Deng Y, Gu F (2018) Evaluation of rutting and friction resistance of hot mix asphalt concrete using an innovative vertically loaded wheel tester. Construct Build Mater 176:710–719

52. Zhang Y, Luo X, Deng Y, Hou S, Shi X, Lytton RL (2020) Evaluation of rutting potential of flexible pavement structures using energy-based pseudo variables. Construct Build Mater 247:118391

53. Zhang J, Pei J, Zhang Z (2012) Development and validation of viscoelastic-damage model for three-phase permanent deformation of dense asphalt mixture. J Mater Civil Eng 24(7):842–850

54. Zienkiewicz OC, Humpheson C, Lewis R (1975) Associated and non-associated visco-plasticity and plasticity in soil mechanics. Geotechnique 25(4):671–689

55. Khan AS, Huang S (1995) Continuum theory of plasticity. John Wiley & Sons, New York, NY

56. Fwa T, Tan S, Zhu L (2004) Rutting prediction of asphalt pavement layer using C-φ model. J Transp Eng 130(5):675–683

57. Tan S-A, Low B-H, Fwa T (1994) Behavior of asphalt concrete mixtures in triaxial compression. J Test Eval 22(3):195–203

58. Zhang Y (2012) Anisotropic characterization of asphalt mixtures in compression, Civil and Environmental Engineering. Texas A&M University, College Station

59. Schapery RA (1997) Nonlinear viscoelastic and viscoplastic constitutive equations based on thermodynamics. Mech Time Depend Mater 1(2):209–240

60. Zhang Y, Luo R, Lytton RL (2013) Mechanistic modeling of fracture in asphalt mixtures under compressive loading. J Mater Civil Eng 25(9):1189–1197

61. Behnke R, Wollny I, Hartung F, Kaliske M (2019) Thermo-mechanical finite element prediction of the structural long-term response of asphalt pavements subjected to periodic traffic load: Tire-pavement interaction and rutting. Comput Struct 218:9–31

62. Deng Y, Zhang Y, Luo X, Lytton RL (2022) Development of equivalent stationary dynamic loads for moving vehicular loads using artificial intelligence-based finite element model updating. Eng With Comput 38(4):2955–2974

63. Fang H, Haddock JE, White TD, Hand AJ (2004) On the characterization of flexible pavement rutting using creep model-based finite element analysis. Finite Elements Anal Des 41(1):49–73

64. Huang B, Mohammad LN, Rasoulian M (2001) Three-dimensional numerical simulation of asphalt pavement at Louisiana accelerated loading facility. Transp Res Rec 1764(1):44–58

65. Ali B, Sadek M, Shahrour I (2009) Finite-element model for urban pavement rutting: Analysis of pavement rehabilitation methods. J Transp Eng 135(4):235–239

66. Wu Z, Chen X, Yang X, Zhang Z (2011) Finite element model for rutting prediction of flexible pavement with cementitiously stabilized base– subbase. Transp Res Rec 2226(1):104–110

67. Li L, Huang X, Han D, Dong M, Zhu D (2015) Investigation of rutting behavior of asphalt pavement in long and steep section of mountainous highway with overloading. Construct Build Mater 93:635–643

68. Huang K, Onifade I, Birgisson B (2021) Rutting performance of flexible pavements using new energy-based potentials. Construct Build Mater 266:120896

69. Abu Al-Rub RK, Darabi MK, Huang CW, Masad EA, Little DN (2012) Comparing finite element and constitutive modelling techniques for predicting rutting of asphalt pavements. Int J Pavement Eng 13(4):322–338

70. Luo X, Li H, Deng Y, Zhang Y (2020) Energy-based kinetics approach for coupled viscoplasticity and viscofracture of asphalt mixtures. J Eng Mech 146(9):04020100

71. L. Shell International Petroleum Company, Shell pavement design manual: Asphalt pavements and overlays for road traffic, Shell International Petroleum Company, London, England, 1978.

72. Khedr SA, Mikhail M (1996) Design of flexible pavements and overlay using an expert system. Transp Res Rec 1543(1):20–28

73. Ricardo Archilla A, Madanat S (2001) Statistical model of pavement rutting in asphalt concrete mixes. Transp Res Rec 1764(1):70–77

74. Epps JA (2002) Recommended performance-related specification for hot-mix asphalt construction: Results of the WesTrack project. Transportation Research Board, Washington, DC

75. Witczak MW (2007) pecification Criteria for Simple Performance Tests for Rutting, Volume I: Dynamic Modulus (E\*) and Volume II: Flow Number and Flow Time. Arizona State University, Washington, DC, p 94

76. Ji X, Zheng N, Hou Y, Niu S (2013) Application of asphalt mixture shear strength to evaluate pavement rutting with accelerated loading facility (ALF). Construct Build Mater 41:1–8

77. Korkiala-Tanttu L, Dawson A (2007) Relating full-scale pavement rutting to laboratory permanent deformation testing. Int J Pavement Eng 8(1):19–28

78. Archilla AR (2006) Repeated measurement data analysis in pavement deterioration modeling. J Infrastructure Sys 12(3):163–173

79. Sullivan BW (2002) Development of flow number and flow time candidate simple performance test for asphalt mixtures. Arizona State University, Tempe, AZ

80. Kim WJ, Lee HJ, Phan HT (2017) Calibration and validation of a rutting model based on shear stress to strength ratio for asphalt pavements. Construction and Building Materials 149:327–337

81. Deacon JA, Harvey JT, Guada I, Popescu L, Monismith CL (2002) Analytically based approach to rutting prediction. Transp Res Rec 1806(1):9–18

82. Zhou F, Scullion T, Sun L (2004) Verification and modeling of three-stage permanent deformation behavior of asphalt mixes. Journal of Transportation Engineering 130(4):486–494

83. Kenis W (1978) An interim design method for flexible pavements using the VESYS structural subsystem. U.S. Department of Transportation, Federal Highway Administration, Washington, DC

84. Zhou F, Scullion T (2002) VESYS5 Rutting model calibrations with local accelerated pavement test data and associated implementation, Texas Transportation Institute. Texas A&M University System, College Station, TX

85. Lytton RL, Luo X, Saha S, Chen Y, Deng Y, Gu F, Ling M (2019) Proposed Enhancements to Pavement ME Design: Improved Consideration of the Influence of Subgrade and Unbound Layers on Pavement Performance. Texas A&M Transportation Institute, College Station, TX

86. Yin F, Arambula E, Lytton R, Martin AE, Cucalon LG (2014) Novel method for moisture susceptibility and rutting evaluation using Hamburg wheel tracking test. Transp Res Rec 2446(1):1–7

87. Alharbi F (2018) Predicting pavement performance utilizing artificial neural network (ANN) models. Iowa State University, Ames, Iowa, Civil Engineering

88. Gong H, Sun Y, Mei Z, Huang B (2018) Improving accuracy of rutting prediction for mechanistic-empirical pavement design guide with deep neural networks. Construct Build Mater 190:710–718

89. Amin S, Ajakaiye M (2020) Machine Learning Algorithms for Rutting Modelling of Bituminous Pavements in West Midlands. 19th Annual International Conference on Highways and Airport Pavement Engineering, Asphalt Technology and Infrastructure. Liverpool, UK

90. Haddad AJ, Chehab GR, Saad GA (2022) The use of deep neural networks for developing generic pavement rutting predictive models. Int J Pavement Eng 23(12):4260–4276

91. Géron A (2019) Hands-on machine learning with Scikit-Learn, Keras, and TensorFlow: Concepts, tools, and techniques to build intelligent systems, 2nd edn. O’Reilly Media Inc, Sebastopol, CA

92. Okuda T, Suzuki K, Kohtake N (2018) Non-parametric Prediction Interval Estimate for Uncertainty Quantification of the Prediction of Road Pavement Deterioration. 018 21st International Conference on Intelligent Transportation Systems (ITSC), IEEE. pp 824-830.

93. Choi S, Do M (2020) Development of the road pavement deterioration model based on the deep learning method. Electronics 9(1):3

94. Ferreira C (2001) Gene expression programming: a new adaptive algorithm for solving problems. Complex Syst 13(2):87–129

95. Liu J, Liu F, Zheng C, Zhou D, Wang L (2022) Optimizing asphalt mix design through predicting the rut depth of asphalt pavement using machine learning. Construct Build Mater 356:129211

96. Gong H, Sun Y, Hu W, Polaczyk PA, Huang B (2019) Investigating impacts of asphalt mixture properties on pavement performance using LTPP data through random forests. Construct Build Mater 204:203–212

97. Nguyen HL, Tran VQ (2023) Data-driven approach for investigating and predicting rutting depth of asphalt concrete containing reclaimed asphalt pavement. Construct Build Mater 377:131116

98. Karniadakis GE, Kevrekidis IG, Lu L, Perdikaris P, Wang S, Yang L (2021) Physics-informed machine learning. Nat Rev Phys 3(6):422–440

## Publisher’s Note

Springer Nature remains neutral with regard to jurisdictional claims in published maps and institutional affiliations.

## Submit your manuscript to a SpringerOpen® journal and benefit from:

▶Convenient online submission

▶Rigorous peer review

▶Open access: articles freely available online

High visibility within the field

▶Retaining the copyright to your article

Submit your next manuscript atspringeropen.com