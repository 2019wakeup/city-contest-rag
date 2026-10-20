<!--
SOURCE: 原始 PDF: City_Contest/ref/133 A Novel Multi-Criteria Decision-Making Model for Building Material Supplier Sele.pdf | 页数: 23 | 集合: city_contest_ref
题录: litfull-nolit-133-a-novel-multi-criteria-decision-making-model-f A
提取: MinerU markdown 全文（可重建索引的真相源副本；images/ 不入 corpus）
-->
Article

# A Novel Multi-Criteria Decision-Making Model for Building Material Supplier Selection Based on Entropy-AHP Weighted TOPSIS

**Chun-Ho Chen**

Professional Architect and Urban Planner, Bachelor Program of Real Estate Investment and Management, Takming University of Science and Technology, No.56, Sec. 1, Huanshan Rd., Neihu District, Taipei 11451, Taiwan; phdchen5598@takming.edu.tw

Received: 2 January 2020; Accepted: 21 February 2020; Published: 24 February 2020

**Abstract:** The type of criterion weight can be distinguished according to different decision methods. Subjective weights are given by decision makers based on their knowledge, experience, expertise, and other factors. Objective weights are obtained through multi-step calculations of the evaluation matrix constructed from the actual information about the evaluation criteria of the alternatives. A single consideration of these two types of weights often results in biased results. In addition, in order to build an effective supply chain source, buyers must find suitable quality products and/or service providers in the process of supplier selection. Based on the above reasons, it is difficult to accurately select the appropriate alternative. The main contribution of this paper is to combine entropy weight, analytic hierarchy process (AHP) weight, and the technique for order preference by similarity to an ideal solution (TOPSIS) method into a suitable multi-criteria decision making (MCDM) solution. The TOPSIS method is extended with entropy-AHP weights, and entropy-AHP weights are used instead of subjective weights. A novel decision-making model of TOPSIS integrated entropy-AHP weights is proposed to select the appropriate supplier. Finally, we take the selection of building material suppliers as an example and use sensitivity analysis to show that the combination of the TOPSIS method based on entropy-AHP weights can effectively select the appropriate supplier.

**Keywords:** decision-making model; entropy-AHP weight; combination weighting method; TOPSIS

## 1. Introduction

The decision-making process usually needs to consider multiple criteria at the same time, and requires multiple standard technologies to assist decision making. In the field of multi-criteria decision-making conditions, decision makers should follow the principle of rationality when choosing the most suitable alternative, that is, to assess a limited set of interdependent or independent criteria [1,2].

Supply chain management (SCM) is mainly to improve competitiveness, optimize business processes, cycle and inventory levels, maximize revenue and profitability, reduce manufacturing costs, improve customer satisfaction, and meet consumer services [3–8]. In the decision-making method of supply chain management, especially in some complex areas, certain criteria need to be defined in advance. In the early stages of the supply chain, choosing the most favorable supplier is one of the most important tasks [9]. Academia and practice have focused extensively on supply chain management in recent years.

The effective procurement mechanism is one of the necessary conditions for a successful supply chain [3,10–12]. The right supplier selection can save the company huge costs and is also an important responsibility of the purchasing agency [13]. Several methods of supplier suitability selection are proposed for discussion. Supplier selection in systematic analysis, including the analytic hierarchy process (AHP) [14,15], the supplier performance matrix approach [16], vendor profile analysis [17], the matrix approach [18], the weighted point method, and taxonomy [19,20].

The supplier selection problem is diversified and contains the characteristics of multi-indicator standards, complexity, and non-structure. This is a multi-standard selection problem [21–24].

Decision-making tasks often ignore subjective and objective factors, such as the failure to consider data information, an incorrect expression of preferences, qualitative criteria, and other qualitative criteria [25,26]. Most methods are designed to solve the problem of supplier selection in non-complex situations [27]. The method of the fuzzy analytic hierarchy process was proposed and constructed as a structural model for rubber supplier evaluation [13].

Hwang and Yoon proposed a well-known and commonly used multi-criteria decision making (MCDM) method, called TOPSIS, which is the technique for order preference by similarity to an ideal solution [28]. The TOPSIS method includes both a positive ideal solution of the benefit type and a negative ideal solution of the cost type. A suitable alternative should be closer to positive ideal solutions, but away from negative ideal solutions.

The academic community attaches great importance to TOPSIS's research method and regards it as one of the main research topics, because it can solve supplier selection objectively and effectively [29,30]. However, the weight of TOPSIS must be determined subjectively by policy makers, so its shortcomings still exist [2,31]. In the final stage of the analysis, we rank all alternatives with TOPSIS and select the most suitable alternative [32].

To effectively solve supplier selection issues, a novel decision-making model of TOPSIS integrated entropy-AHP weight is proposed to select the appropriate supplier. The following in-depth analysis is based on the above information, and the main research themes of this paper are as below:

(1) TOPSIS has its shortcomings in setting weights, and its weight is subjectively judged by decision makers. Therefore, when the information obtained by decision makers is incomplete or the subjective consciousness of the decision makers is too strong, how should such errors be resolved?

(2) The measurement of the first-layer entropy weight is different from the second-layer entropy weight. How do we combine the TOPSIS method with entropy to obtain objective weight values?

(3) The weight obtained by the entropy weight method is an objective weight, which can make up for the deficiency of the subjective weight obtained by AHP. How should we obtain the entropy-AHP weight based on the two weights of the entropy weight method and the AHP method, and apply it to the TOPSIS method?

In this study, in order to choose a suitable building material supplier, we propose a novel decision-making model of the TOPSIS integrated entropy-AHP weight. The entropy-AHP weighted TOPSIS method has huge application and success opportunities in the appropriate supplier selection process. The rest of this paper is divided into five parts. Section 2 introduces the literature review and methodology, and Section 3 presents construction steps of entropy-AHP weighted TOPSIS. Section 4 shows a numerical execution example of building material supplier selection. Section 5 is for results and discussion. Finally, Section 6 presents the conclusions of the study.

## 2. Literature Review and Methodology

The analytic processes of the research framework consist of four stages, as shown in Figure 1: Phase 1: Introduce the research background and review literatures and methods.

Phase 2: Begin to establish a novel TOPSIS model and then combine this model with the entropy and AHP weights.

Phase 3: Extending the TOPSIS method with the entropy-AHP weighting method.

![](images/page_2_image_0.jpg)

Figure 1. Research framework and analytic processes of sections and steps.

Phase 4: Results and discussion.

Sections 2.1 through 2.5 are described in Phase 1, including a review of relevant literatures and methodologies, such as TOPSIS, the entropy weighted method, the AHP method, the combination weighting method and the weights for multi-criteria decision making. As for Sections 3 through 5, it belongs to other phases. Section 6 concludes this study.

## 2.1. Literature Review

## 2.1.1. Literature on the Application of the Entropy, AHP, and/or TOPSIS Method

This section explores related literature on the Entropy, AHP, and/or TOPSIS method studied by researchers. Information entropy is derived from information theory [33], which was originally applied to assess the uncertainty of hydrological models [34]. The experiments show that the entropy information significantly improves the recognition rate and the robustness of the algorithm [35]. Analyzing the coordination relationship between economic development and investment potential with methods such as the entropy weight method, etc. [36]. Based on using TOPSIS technology and applying entropy weight information to calculate criteria weights, aim of this study is to select suitable suppliers in a green environment [37]. Using TOPSIS and entropy methods, a simulation-based multi-objective evaluation of a flow corridor is constructed [38].

By a comparative analysis of AHP and TOPSIS technologies, we can select the optimal transfer station location in Istanbul, Turkey [39]. Based on applying the AHP and TOPSIS methods under a fuzzy environment, the best type of dam spillway in Northern Greece can be selected [40]. On the basis of fuzzy AHP and TOPSIS methods, it allows us to evaluate suppliers and developing mathematical techniques to allocate orders [41]. The social, technical, economical, environmental, and political (STEEP) fuzzy AHP-TOPSIS framework is applied to select the location most suitable for Indian thermal power plants. The fuzzy AHP is used to determine the weights of the quantitative and qualitative criteria affecting the location selection process [42]. Combining neutrosophic (N) theory with AHP and TOPSIS methods to deal with uncertainty, ambiguity, and complexity [43]. Neutrosophic sets, which have been integrated with other technologies, such as AHP and the TOPSIS recently, are used to solve problems [44]. TOPSIS and ELECTRE I models are applied to the diagnostic fuzzy information of medicine [45]. A Delphi-DEMATEL-ANP-TOPSIS hybrid model was established to select strategies for dealing with derailment risks [46].

Based on the above literatures, the research methods for constructing models and solving problems were proposed.

## 2.1.2. Rank Reversals in Decision-Making

In a multi-criteria decision-making process, ranking reversal refers to a change in ranking that overrides the order of possible decisions when, for example, a selection change method or a set of other available alternatives changes. The problem of ranking reversal is at the core of many debates in decision making and multi-criteria decision making. The following multi-criteria decision-making methods have been proven to exhibit various types of ranking reversals, such as [47–52]:

1. Multi-attribute utility theory (MAUT).

2. The [TOPSIS](https://en.wikipedia.org/wiki/TOPSIS) method.

3. The [analytic hierarchy process](https://en.wikipedia.org/wiki/Analytic_hierarchy_process) (AHP) and some of its variants.

4. The [ELECTRE](https://en.wikipedia.org/wiki/ELECTRE) (outranking) method and its variants.

5. The [PROMETHEE](https://en.wikipedia.org/wiki/PROMETHEE) (outranking) method.

Because of the existence of rank reversals, which were described above, the limitation of the novel multi-criteria decision-making model, which is a mix of AHP and TOPSIS may also exist.

## 2.2. Entropy Weighted Method

## 2.2.1. Entropy Weight Principle

Entropy is a thermodynamic concept proposed by German physicist R. Clausius in 1865. It describes the disorder or chaos of a thermodynamic system and is a state parameter of matter. In 1948, Shannon introduced entropy into information theory, which measures the uncertainty of signals in information sources, called information entropy.

The entropy weight method mainly uses the magnitude of the entropy value in information theory to represent the uncertainty of the message, calculates the ability of each evaluation attribute to pass decision information, and calculates the relative weight between attributes. From the judgment matrix, the entropy weight can be calculated [53–56]. "The smaller the entropy of the evaluated information criterion, the greater the weight of the information criterion". This is only true if the underlying assumptions that all sources of information are reliable. Of course, the novel multi-criteria decision-making model proposed in this paper is no exception.

## 2.2.2. Significance and Nature of Entropy Weight Method

Th method of the entropy weight is to calculate the information entropy of the indicator and use the degree of difference of the indicator to measure the effective information and indicator weight contained in the known data. The entropy weight indicates the relative importance coefficient of each indicator in the competition under the conditions of a given evaluation object and evaluation index when making a decision or evaluation plan, but it does not indicate the importance coefficient of the indicator in the practical sense. Its properties are as follows:

a. If the values of elements in a column are the same, the maximum entropy is 1, and the entropy weight is 0. On behalf of an indicator, if the data of each evaluation object are the same, the indicator does not contain any valuable information.

b. The greater the difference between the values of elements in a column, the smaller the entropy value of the elements in this column and the larger the entropy weight value. It indicates that the indicator has valuable information. Conversely, if the indicator's entropy value is larger, the smaller its entropy weight and the less important this indicator is.

The basic calculation steps are as follows:

## 1. Initial data matrix normalization

Set m evaluation objects and n evaluation indicators to form the initial data matrix of the entropy weight evaluation system.

$$
\mathbf { \boldsymbol { X } } = \left[ \begin{array} { c c c c } \mathbf { x } _ { 1 1 } & \mathbf { x } _ { 1 2 } & \ldots & \mathbf { x } _ { 1 \mathbf { n } } \\ \mathbf { x } _ { 2 1 } & \mathbf { x } _ { 2 2 } & \ldots & \mathbf { x } _ { 2 \mathbf { n } } \\ \vdots & \vdots & & \vdots \\ \mathbf { x } _ { \mathbf { m } 1 } & \mathbf { x } _ { \mathbf { m } 2 } & \ldots & \mathbf { x } _ { \mathbf { m } \mathbf { n } } \end{array} \right] = \left( \boldsymbol { X } _ { 1 } \boldsymbol { X } _ { 2 } \ldots \boldsymbol { X } _ { n } \right)\tag{1}
$$

where $\mathbf{x}_{\mathrm{ij}}(\mathrm{i}=1,2,\ldots,\mathrm{m};\mathrm{j}=1,2,\ldots,\mathrm{n})$ represents the value of the i-th evaluation alternative in the j-th indicator, and $X _ { \mathrm { j } } \; ( \mathrm { j } { = } 1 ,   2 , . . . ,   \mathrm { n } )$ denotes the column vector data of all evaluation alternatives of the j-th indicator.

Due to the differences in the indicator units, for the purpose of eliminating the impact of different units on the evaluation results, each indicator needs to be standardized. The step transformation method is often used and the formula is:

$$
\mathbf{x}_{\mathbf{ij}}^{\prime}=\frac{\mathbf{x}_{\mathbf{ij}-}\min\limits_{\mathbf{i}}\{\mathbf{x}_{\mathbf{ij}}\}}{\max\limits_{\mathbf{i}}\{\mathbf{x}_{\mathbf{ij}}\}-\min\limits_{\mathbf{i}}\{\mathbf{x}_{\mathbf{ij}}\}}\tag{2}
$$

$$
\mathrm{or} \mathrm{x}_{\mathrm{j}}^{\prime}=\frac{\mathrm{x}_{\mathrm{ij}-\min \{\mathrm{x}_{\mathrm{ij}}\}}}{\max \{\mathrm{x}_{\mathrm{j}}\}-\min \{\mathrm{x}_{\mathrm{j}}\}} \quad(\text { applicable benefit indicators})
$$

$$
\mathrm{x}_{\mathrm{ij}}^{\prime}=\frac{\max _{\mathrm{i}}\{\mathrm{x}_{\mathrm{ij}}\}-\mathrm{x}_{\mathrm{ij}}}{\max _{\mathrm{i}}\{\mathrm{x}_{\mathrm{ij}}\}-\min _{\mathrm{i}}\{\mathrm{x}_{\mathrm{ij}}\}}\tag{3}
$$

$$
\mathrm{or} \mathrm{x}_{\mathrm{j}}^{\prime}=\frac{\max \left\{\mathrm{x}_{\mathrm{ij}}\right\}-\mathrm{x}_{\mathrm{ij}}}{\max \left\{\mathrm{x}_{\mathrm{j}}\right\}-\min \left\{\mathrm{X}_{\mathrm{j}}\right\}} \quad(\text { applicable cost indicators})
$$

2. Estimate the proportion $\mathbf { z _ { i j } }$ of the j-th indicator i-th evaluation alternative $\mathbf { x } _ { \mathbf { i j } } ^ { \prime }$

$$
\mathrm{z}_{\mathrm{ij}}=\frac{\mathrm{x}_{\mathrm{ij}}^{\prime}}{\sum_{\mathrm{i}=1}^{\mathrm{m}} \mathrm{x}_{\mathrm{ij}}^{\prime}} \text { or } \mathrm{Z}_{\mathrm{j}}=\frac{\mathrm{x}_{\mathrm{j}}^{\prime}}{\sum \mathrm{x}_{\mathrm{j}}^{\prime}} \text { (j=1, 2, \cdots, n) }\tag{4}
$$

So, get the weight matrix:

$$
Z = (z_{ij})_{m \times n}   or   Z = (Z_1 Z_2 \ldots Z_n)\tag{5}
$$

3. Calculate the value of the information entropy of the j-th indicator $\mathbf { e _ { \mathrm { j } } }$

$$
\mathbf{e}_{\mathrm{j}}=-\pi \sum_{\mathrm{i}=1}^{\mathrm{m}} \mathrm{z}_{\mathrm{ij}} \ln \mathrm{z}_{\mathrm{ij}} \quad(\mathrm{j}=1, 2, \cdots, \mathrm{n})\tag{6}
$$

among them, $\begin{array} { r } { \mathfrak { m } = \frac { 1 } { \ln \mathfrak { m } } } \end{array}$ is non-negative constant, and $0 \leq \mathsf { e } _ { \mathrm { j } } \leq 1$ . When set $\mathbf { z } _ { \mathrm { i j } } = 0 ,$ , $\mathbf { z _ { i j } }$ ln $\mathbf { z } _ { \mathrm { i j } }   = 0$ .

4. Calculate the information utility $\mathbf { b _ { j } }$ for the j-th indicator

$$
\mathbf{b}_{\mathbf{j}} = 1 - \mathbf{e}_{\mathbf{j}} ( \mathbf{j} = 1, 2, \cdots, \mathbf{n} )\tag{7}
$$

5. Calculate the weight $w _ { \mathrm { j } }$ of the j-th indicator

$$
\mathrm{w}_{\mathrm{ej}}=\frac{\mathrm{b}_{\mathrm{j}}}{\sum_{\mathrm{j}=1}^{\mathrm{n}} \mathrm{b}_{\mathrm{j}}}=\frac{1-\mathrm{e}_{\mathrm{j}}}{\mathrm{n}-\sum_{\mathrm{j}=1}^{\mathrm{n}} \mathrm{e}_{\mathrm{j}}} \quad(\mathrm{j}=1,2, \cdots, \mathrm{n})\tag{8}
$$

6. Estimate the evaluation value $\mathrm { U _ { i } }$ of the evaluation plan i

$$
\begin{array} { r } { U _ { i } = \sum _ { j = 1 } ^ { n } \mathtt { z } _ { i j } w _ { e j } \quad ( \mathtt { i }   =   1 , 2 ,     \cdots , \mathtt { m } ) } \end{array}\tag{9}
$$

When the entropy value is smaller, the degree of dispersion of the indicator is greater. It shows that the greater the usefulness of the information, the larger the impact of this indicator on the target in the comprehensive evaluation.

## 2.3. AHP Method

## 2.3.1. The Meaning of AHP

The Analytic Hierarchy Process (AHP) method was first created in 1971 by Professor Thomas L. Saaty of the University of Pittsburgh. The AHP method reduces the complex problem system to a clear element system. In the analysis process, the eigenvector is used to represent the priority ratio between the elements in a hierarchy, and then the eigenvalue is obtained as the basis for evaluating the consistency of the dual comparison matrix performed on the nominal scale. If the consistency conditions are met, the priority order represented by the eigenvector will be used as the basis for selection or decision making [57–59].

## 2.3.2. Application of AHP

The objective hierarchy structure can be constructed by hierarchical analysis. The methods that can be adopted to develop the objective hierarchy structure are generally related literature review, systematic analysis, and empirical analysis. The weighting system of the hierarchical analysis method, that is, by the experts and scholars' understanding of the evaluation system, the evaluation items and criteria are made into a pairwise ratio allocation on a category scale. Since the weight obtained by the AHP method is obtained through the recognition of experts and scholars, it is classified as one of the subjective weights.

In other words, every two factors are compared in pairs and a dual comparison reciprocal matrix is established to obtain the feature vector. This feature vector is the relative weight of each factor and the relative importance in a particular category. Then, the eigenvalues are obtained from the eigenvectors. After the consistency check of the dual matrix, the conformance of this matrix can be accepted. The consistency test can find that in some questionnaires, when the dual comparison is performed, the C factor is less important than the B factor and the B factor is less important than the A factor. Contradictory questionnaires can be tested by a consistency check. Additionally, through the questionnaire, the eigenvector can be used as the basis for evaluating the weight.

## 2.3.3. Steps of AHP Method

The AHP method proceeds as follows:

## 1. Build a hierarchical structure

Classify the factors involved in the problem and construct a hierarchical structure of the interconnections between the factors. A typical hierarchical structure is shown in Figure 2.

![](images/page_6_image_7.jpg)

Figure 2. Schematic diagram of the hierarchy.

2. Calculate the weight of each single-level model

## 3. Calculate the combined weight of each level element

The combined weights of the hierarchical elements can be calculated according to Table 1, obviously $\textstyle \sum _ { \mathrm { j } = 1 } ^ { \mathrm { n } } s _ { \mathrm { j } } = 1$

Table 1. Combined weights at each level.

<table><tbody><tr><td rowspan="2">R-level Weight S-level</td><td>𝑅<sub>1</sub></td><td>𝑅<sub>2</sub></td><td>⋯</td><td>𝑅<sub>𝑛</sub></td><td rowspan="2">S-level element combination weight</td></tr><tr><td>𝑟<sub>1</sub></td><td>𝑟<sub>2</sub></td><td>⋯</td><td>𝑟<sub>𝑛</sub></td></tr><tr><td>𝑆<sub>1</sub></td><td>𝑠11</td><td>𝑠12</td><td>⋯</td><td>𝑠1𝑛</td><td>s1 = ∑n ris1i i=1</td></tr><tr><td>𝑆<sub>2</sub></td><td>𝑠21</td><td>𝑠22</td><td>⋯</td><td>𝑠2𝑛</td><td>s2 = ∑n ris2i i=1</td></tr><tr><td>⋮</td><td>⋮</td><td>⋮</td><td></td><td>⋮</td><td>⋮</td></tr><tr><td rowspan="2"></td><td>𝑅<sub>1</sub></td><td>𝑅<sub>2</sub></td><td>⋯</td><td>𝑅<sub>𝑛</sub></td><td rowspan="2">S-level element combination weight</td></tr><tr><td>𝑟<sub>1</sub></td><td>𝑟<sub>2</sub></td><td>⋯</td><td>𝑟<sub>𝑛</sub></td></tr><tr><td>𝑆<sub>4</sub></td><td>𝑠𝑚1</td><td>𝑠𝑚2</td><td>⋯</td><td>𝑠𝑚𝑛</td><td>sm = ∑n rismi i=1</td></tr></tbody></table>

## 4. Evaluate the overall ranking of the hierarchy and calculate the consistency of the results

There are two main AHP consistency tests: one is the consistency index (CI) test, and the other is the consistency ratio (CR) test.

## (1) CI test

CI means (λmax-n) / (n-1) where the closer the value of λmax is to n, the better the consistency and the smaller the CI value.

## (2) CR test

CR means CI/RI where RI is a consistency and random index that randomly generates a reciprocal matrix, and is affected by the order. When the order n is larger, the value increases. Saaty (1981) believes that when the value of the consistency ratio (CR) is equal to or less than 0.1, the consistency of this matrix is acceptable.

## 2.4. Combination Weighting Method

The method of comprehensively considering the subjective weight and the objective weight of the evaluation standard is the combination weighting method. In the "multi-criteria decision" evaluation method, the weight value of the criteria has the ability to affect the evaluation result and has an important influence on the choice of the scheme. The combined weighting method will reduce the possible bias of a single subjective or objective weight on the choice of scheme. Suppose there are n evaluation index items at a certain level or an evaluation facet.

The weights determined by the AHP method and the entropy weight method are $W _ { h } =$ $( \mathbf { w } _ { h 1 } , \mathbf { w } _ { h 2 } , \dots , \mathbf { w } _ { h \mathrm { n } } )$ and $W _ { e } = ( \mathsf { w _ { e 1 } } , \mathsf { w _ { e 2 } } , \dots , \mathsf { w _ { e n } } )$ . The calculation of a combination weight that integrating the subjective weights and objective weights of the n criteria, is expressed as follows:

$$
w_{cj} = \frac{w_{ej \times} w_{hj}}{\sum_{j=1}^{n} w_{ej \times} w_{hj}}, \quad  j =1,2,\cdots,  n .\tag{10}
$$

## 2.5. Weights for Multi-Criteria Decision Making

In the evaluation method of multi-criteria decision making, the criterion weight often has a great influence on the choice of the scheme. That is, different criterion weights may lead to different evaluation results. Generally speaking, the calculation methods of criterion weights can be divided into the following three categories:

## 1. Subjective weight:

Weights based on the subjective consciousness of decision makers or experts. In addition to the direct calculation of subjective weights by decision makers, many scholars have developed other methods, such as: (1) the AHP method [60]; (2) the extreme weight approach [61];(3) the weighted least square method [62]; (4) the linear programming techniques for multidimensional analysis of preference (LINMA) method [63].

The timing of applying subjective weights may lie in the evaluation of quantification and qualitative criteria, especially when expert expertise is required.

## 2. Objective weight:

Weights based on evaluation matrix measurements. The calculation methods of objective weights include: (1) th entropy weight method [28]; (2) the gray relational matrix method [64].

The timing of applying objective weights can only be in the evaluation of quantitative criteria, and the sources of quantitative data should be reliable. This important basic assumption is necessary.

## 3. Eclectic weights:

The weights are calculated based on the combination weighting method. Its purpose is to consider both the subjective weights of the decision makers and the objective weights calculated by the entropy weight method through the measurement of each criterion. And its advantages are [65]:

(1)The difference between subjective and objective weights can be compromised.

(2)The deviation of the evaluation results can be reduced.

(3) High reliability of analysis results.

## 3. Construction Steps of Entropy-AHP Weighted TOPSIS

Let the set of alternatives be expressed as $\mathrm { A } { = } \{ \mathrm { A } _ { 1 } , \mathrm { A } _ { 2 } , \ldots , \mathrm { A } _ { \mathrm { m } } \}$ , and the set of criteria be expressed as $\scriptstyle \mathbb { C } = \{ \mathbb { C } _ { 1 } , \mathbb { C } _ { 2 } , \dots , \mathbb { C } _ { \mathtt { n } } \} ,$ , the construction process of entropy-AHP weighted TOPSIS method can be shown as follows:

Step 1: Constructing the decision matrix.

In this step, we obtain performance value $\mathbf { d } _ { \mathbf { i j } }$ and establish the decision matrix $\mathbf{D} = \left[ \mathbf{d}_{ij} \right]_{\mathbf{m} \times \mathbf{n}}$ . The decision matrix for evaluation can be presented as follows:

$$
\mathbf{D} = \begin{array}{c}\mathbf{C}_{1} \quad \mathbf{C}_{2} \quad \ldots \quad \mathbf{C}_{\mathsf{n}} \\\mathbf{A}_{1} \\\mathbf{A}_{2} \\\vdots \\\mathbf{A}_{\mathsf{m}}\end{array}\begin{bmatrix}d_{11} & d_{12} & \ldots & d_{1\mathsf{n}} \\d_{11} & d_{12} & \ldots & d_{1\mathsf{n}} \\d_{21} & d_{22} & \ldots & d_{2\mathsf{n}} \\\vdots & \vdots & \ddots & \vdots \\d_{m1} & d_{m2} & \ldots & d_{m1}\end{bmatrix}\tag{111}
$$

The decision matrix D contains n criteria and m alternatives. In addition, C denotes the criterion and A denotes the alternative.

Step 2: Normalizing the decision matrix.

In order to make utility preferences have a consistent unit of measurement, while avoiding extreme values that affect the measurement of similarity distances, statistical normalization methods are used to normalize performance values. A normalized performance value $( \mathbf { p } _ { \mathrm { i j } } )$ is expressed as follows:

$$
\mathrm { p _ { i j } = \frac { d _ { i j } } { \sum _ { i } d _ { i j } } , \qquad \forall i , j }\tag{12}
$$

Then novel decision matrix can be expressed as follows:

$$
\begin{array}{c}\mathsf{C}_{1} \quad \mathsf{C}_{2} \quad \ldots \quad \mathsf{C}_{\mathsf{n}} \\\mathsf{A}_{1} \\\mathsf{D}^{*}{=} \mathsf{A}_{2} \\\vdots \\\mathsf{A}_{\mathsf{m}} \\\end{array}\begin{bmatrix}\mathsf{p}_{11} & \mathsf{p}_{12} & \ldots & \mathsf{p}_{1\mathsf{n}} \\\mathsf{p}_{11} & \mathsf{p}_{12} & \ldots & \mathsf{p}_{1\mathsf{n}} \\\mathsf{p}_{21} & \mathsf{p}_{22} & \ldots & \mathsf{p}_{2\mathsf{n}} \\\vdots & \vdots & \ddots & \vdots \\\mathsf{p}_{\mathsf{m}1} & \mathsf{p}_{\mathsf{m}2} & \ldots & \mathsf{p}_{\mathsf{mn}} \\\end{bmatrix}\tag{13}
$$

Step 3: Calculating the objective weights of criteria using the entropy method.

The value $( \mathbf { e } _ { \mathrm { j } } )$ for the information entropy of the j-th criterion can be calculated as follows:

$$
\begin{array} { r } { \mathbf { e _ { j } } = - \pi \sum _ { \mathrm { i = 1 } } ^ { \mathrm { m } } \mathrm { z _ { i j } } \ln \mathrm { z _ { i j } } \quad \mathrm { ( j ~ = ~ 1 , ~ 2 , \cdots , ~ n ) } } \end{array}\tag{14}
$$

where $\mathbf{z}_{\mathrm{ij}} = \frac{\mathbf{p}_{\mathrm{ij}}}{\sum_{\mathrm{i}=1}^{\mathrm{m}} \mathbf{p}_{\mathrm{ij}}} , \quad \pi = \frac{1}{\ln \mathrm{m}}$ is a non-negative constant, and $0 \leq \mathsf { e } _ { \mathrm { j } } \leq 1$ . Then, calculate the weight $\mathbf { w _ { e j } }$ of the j-th index.

$$
\mathrm{w}_{\mathrm{ej}}=\frac{1-\mathrm{e}_{\mathrm{j}}}{\mathrm{n}-\sum_{\mathrm{j}=1}^{\mathrm{n}} \mathrm{e}_{\mathrm{j}}} \quad(\mathrm{j}=1, 2, \cdots, \mathrm{n})\tag{15}
$$

Step 4: Calculating the weights of criteria using the AHP method.

According to the steps of the 2.2.3 AHP method. The AHP weight of each criterion can be obtained as follows:

$$
w _ { h j } = ( \mathsf { w } _ { h 1 } , \mathsf { w } _ { h 2 } , \dots , \mathsf { w } _ { h \mathfrak { n } } ) \qquad ( \mathsf { j }   =   1 , \; 2 , \dots , \; \mathfrak { n } )\tag{16}
$$

Step 5: Determining the combination weight of each criterion.

According to Equation (15) and (16), the weight of each criterion can be obtained on the basis of the combined weighting method as follows. The weight of each criterion is determined by a combined weighting method.

$$
\begin{array} { r } { ^ { i } w _ { c j } = \frac { ^ { i } w _ { e j } \times ^ { i } w _ { h j } } { \sum _ { j = 1 } ^ { n } ^ { i } w _ { e j } \times ^ { i } w _ { h j } } , \quad \mathrm { i } = 1 , 2 , \cdots , \mathrm { \bf ~ m } ; \mathrm { \bf ~ j } = 1 , 2 , \cdots , \mathrm { \bf ~ n } . } \end{array}\tag{17}
$$

where $w _ { e j }$ is the objective weight derived from entropy and $w _ { h j }$ is the subjective weight derived from the AHP method.

Step 6: Establishing the entropy-AHP weight of the decision matrix.

The entropy-AHP weight of the decision matrix can be expressed as follows:

$$
w _ { c j }   =   ^ { 1 } \mathsf { w } _ { \mathsf { c i } } \times   ^ { 2 } \mathsf { w } _ { \mathsf { c j } } , \quad \mathrm { i }   =   1 , ~ 2 , \cdots , ~ \mathsf { m } ; ~ \mathrm { j }   =   1 , ~ 2 , \cdots , ~ \mathsf { n }\tag{18}
$$

Step 7: Building the combination weighting normalization decision matrix.

In order to reflect the fact that the greater the weight of the evaluation criterion, the more important its performance value is. The performance value of the criterion must be multiplied by the weight. The combination weighting normalization decision matrix can be expressed as follows:

$$
\mathbf { u } = \begin{array} { r } { \mathsf { C } _ { 1 } \quad \mathsf { C } _ { 2 } \quad \ldots \quad \mathsf { C } _ { \mathsf { n } } } \\ { \mathsf { A } _ { 1 } } \\ { \mathsf { A } _ { 2 } } \\ { \vdots } \\ { \mathsf { A } _ { \mathsf { m } } } \end{array} \begin{array} { r } { \mathsf { C } _ { 1 } \quad \mathsf { C } _ { 2 } \quad \ldots \quad \mathsf { C } _ { \mathsf { n } } } \\ { \mathsf { u } _ { 1 1 } \quad \mathsf { u } _ { 1 2 } \quad \ldots \quad \mathsf { u } _ { 1 \mathsf { n } } } \\ { \mathsf { u } _ { 2 1 } \quad \mathsf { u } _ { 2 2 } \quad \ldots \quad \mathsf { u } _ { 2 \mathsf { n } } } \\ { \vdots \quad \vdots \quad \ddots \quad \vdots } \\ { \mathsf { u } _ { \mathsf { m } 1 } \quad \mathsf { u } _ { \mathsf { m } 2 } \quad \ldots \quad \mathsf { u } _ { \mathsf { m } \mathsf { n } } } \end{array}\tag{19}
$$

$$
where $\mathbf { \nabla } \mathtt { u } _ { i j } = w _ { c j } \times p _ { i j } , \quad \forall \mathrm { i } , \}$\tag{20}
$$

Step 8: Acquire the solutions of the negative-ideal (NI) and the positive-ideal (PI).

The evaluation criteria of the TOPSIS method can be divided into cost criteria and benefit criteria. Let C be a set of cost criteria and B be a set of benefit criteria. $A ^ { - }$ represents the negative-ideal solution and $\mathrm { A } ^ { + }$ is the positive-ideal solution. Then, $A ^ { + }$ and $A ^ { - }$ can be acquired as:

$$
\begin{align*}\mathrm{A}^{+} &= \left( \left( \max_{\mathrm{i}} \mu_{\mathrm{ij}} \Big| \mathrm{j} \in \mathrm{B} \right), \left( \min_{\mathrm{i}} \mu_{\mathrm{ij}} \Big| \mathrm{j} \in \mathrm{C} \right) \right) \\&= \left( \mathrm{u}_{\mathrm{j}}^{+} \Big| \mathrm{j} = 1, 2, \ldots, \mathrm{m} \right)\end{align*}\tag{21}
$$

$$
\begin{align*}\mathrm{A}^{-} &= \left( \left( \min_{\mathrm{i}} \mu_{\mathrm{ij}} \Big| \mathrm{j} \in \mathrm{B} \right), \left( \max_{\mathrm{i}} \mu_{\mathrm{ij}} \Big| \mathrm{j} \in \mathrm{C} \right) \right) \\&= \left( \mathrm{u}_{\mathrm{j}}^{-} \big| \mathrm{j} = 1, 2, \ldots, \mathrm{m} \right)\end{align*}\tag{22}
$$

Step 9: Measure the distance from NIS (solution of NI) and PIS (solution of PI).

For the purpose of calculating the distance from PIS or NIS to each alternative $\mathbf { A _ { i } } .$ . The Euclidean distance is expressed by the following calculation:

$$
S ^ { + } = \sqrt { \sum _ { \mathrm { j } = 1 } ^ { \mathrm { n } } ( \mathrm { u } _ { \mathrm { i j } } - \mathrm { u } _ { \mathrm { i j } } ^ { + } ) ^ { 2 } } .\tag{23}
$$

$$
S ^ { - } = \sqrt { \sum _ { \mathrm { j } = 1 } ^ { \mathrm { n } } ( \mathrm { u } _ { \mathrm { i j } } - \mathrm { u } _ { \mathrm { i j } } ^ { - } ) ^ { 2 } }\tag{24}
$$

Step 10: Calculate the relative proximity of PIS.

The relative proximity of an alternative $\mathrm { A _ { i } }$ to the positive-ideal solution (PIS) $\mathrm { A } ^ { + }$ can be expressed as follows:

$$
\varphi_{i}=\frac{S^{-}}{S^{+}+S^{-}} \text {, where } 0 \leq \varphi_{i} \leq 1\tag{25}
$$

Step 11: Ranking the alternatives.

Alternatives are ranked in descending order of $\boldsymbol { \Phi _ { \mathrm { i } } } ^ { \prime } \boldsymbol { s }$ value according to the relative proximity of each alternative. Some alternatives have larger relative proximity values, indicating that they are closer to PIS. Finally, the most suitable choice will be the one with the highest proximity value.

## 4. Numerical Execution Example of Building Material Supplier Selection

A capital company wants to select the most appropriate supplier as its investment target. Five building material suppliers were selected as alternatives for further evaluation. The numerical input values are quoted or revised by referring to the data of some building material suppliers in Taiwan. To avoid unnecessary commercial disputes, the supplier’s names have not been disclosed. Although the supplier name is represented by the codes A1\~A5, this representation will not affect the process and results of the novel multi-criteria decision-making model in selecting the appropriate supplier.

The first layer contains 3 facets of product satisfaction, supply innovation capability, and service level. The second layer includes 7 criteria, such as $C _ { 1 } ;$ the rate of qualified products $(\%),\ C_{2};$ the product price (thousand dollars), $C _ { 3 } ;$ the rate of product market share $(\%),\ C_{4};$ the supply capacity (kg / time), $C _ { 5 } ;$ the new product development rate (%), $C _ { 6 } ;$ the delivery time (days), and $C _ { 7 } ;$ the delivery on time ratio (%). The analytic hierarchy diagrams of the two levels and the seven criteria are shown in Figure 3.

Target

![](images/page_10_image_9.jpg)

Figure 3. Hierarchical analysis diagram of this study.

Step 1: Constructing the decision matrix.

A decision matrix is established with five alternatives and seven criteria. The decision matrix was expressed as below:

$$
\begin{bmatrix} \mathrm{D}=\begin{array}{c}A_{1} \\A_{2} \\\vdots \\A_{5}\end{array}\begin{bmatrix}C_{1} & C_{2} & \ldots & C_{7} \\d_{11} & d_{12} & \ldots & d_{17} \\d_{21} & d_{22} & \ldots & d_{27} \\\vdots & \vdots & \ddots & \vdots \\d_{51} & d_{52} & \ldots & d_{57}\end{bmatrix}=\begin{array}{c}A_{1} \\A_{2} \\A_{3} \\A_{4} \\A_{5}\end{bmatrix}\begin{bmatrix}C_{1} & C_{2} & C_{3} & C_{4} & C_{5} & C_{6} & C_{7} \\0.95 & 36 & 0.19 & 53 & 0.73 & 11 & 0.93 \\0.93 & 33 & 0.21 & 52 & 0.75 & 11 & 0.92 \\0.91 & 37 & 0.23 & 56 & 0.77 & 12 & 0.87 \\0.92 & 35 & 0.16 & 51 & 0.76 & 10 & 0.86\end{bmatrix} \end{array}
$$

where A represents the alternative and C represents the criterion.

Step 2: Normalizing the decision matrix.

In this step, the new decision matrix based on normalized performance by Equation (12) $\mathbf { p } _ { \mathrm { i j } } =$ $\frac { \mathbf { d } _ { \mathrm { i j } } } { \sum _ { \mathrm { i } } \mathbf { d } _ { \mathrm { i j } } }$ and Equtation (13) is as follows:

<table><tr><td colspan="2"></td><td>C1</td><td>C2</td><td></td><td>C7</td><td></td><td>C1</td><td>C2</td><td>C3</td><td>C4</td><td>C5</td><td>C6</td><td>C7</td></tr><tr><td rowspan="5">D* =A₂</td><td>A1</td><td>[P11</td><td>P12</td><td></td><td>P17]</td><td>A1</td><td>0.2026</td><td>0.2000</td><td>0.1979</td><td>0.1970</td><td>0.1973</td><td>0.1930</td><td>0.20811</td></tr><tr><td></td><td>P21</td><td>P22</td><td></td><td>P27 二</td><td>A2</td><td>0.2090</td><td>0.2167</td><td>0.1771</td><td>0.1933</td><td>0.2027</td><td>0.2281</td><td>0.1991</td></tr><tr><td>:</td><td></td><td>:</td><td></td><td>...</td><td>A₃</td><td>0.1983</td><td>0.1833</td><td>0.2188</td><td>0.2119</td><td>0.1865</td><td>0.1930</td><td>0.2058</td></tr><tr><td></td><td></td><td></td><td></td><td></td><td>A₄</td><td>0.1940</td><td>0.2056</td><td>0.2396</td><td>0.2082</td><td>0.2081</td><td>0.2105</td><td>0.1946</td></tr><tr><td>A5</td><td>lp51</td><td>P52</td><td></td><td>P57]</td><td>A5</td><td>l0.1962</td><td>0.1944</td><td>0.1677</td><td>0.1896</td><td>0.2054</td><td>0.1745</td><td>0.1924</td></tr></table>

Step 3: Calculating the objective weights of criteria using the entropy method.

According to Figure 3, the analysis group can be divided into 4 categories. Category 1 is "product satisfaction" (3 criteria), Category 2 is "supply innovation capability" (2 criteria), Category 3 is "service level" (2 criteria), and Category 4 is "suitable supplier selection" (7 criteria). This step will use Category 1 as a case to demonstrate the calculation process of its entropy weight.

## (1) Initial data matrix normalization.

Based on the decision matrix in Step 1, set 5 alternatives and 3 criteria to form the initial data matrix of the evaluation system of Category 1.

$$
\begin{bmatrix} \begin{bmatrix} \begin{bmatrix} D_{E1} = \begin{array}{c}A_{1} \\C_{1} \\A_{2} \\\vdots \\A_{5} \\\end{array}\begin{bmatrix}A_{1} \\C_{1} \\A_{2} \\\vdots \\A_{5} \\\end{bmatrix}\begin{bmatrix}A_{1} & C_{1} \\C_{1} & C_{2} \\C_{1} & 0 \\\end{bmatrix}\begin{array}{c}C_{3} \\C_{1} \\d_{13} \\d_{2} \\\vdots \\d_{5} \\\end{bmatrix}=\begin{array}{c}A_{1} \\A_{2} \\A_{3} \\A_{4} \\A_{5} \\\end{bmatrix}\begin{bmatrix}A_{1} \\A_{2} \\A_{3} \\\vdots \\A_{5} \\\end{bmatrix}=\begin{bmatrix}A_{1} \\C_{1} \\\end{bmatrix}\begin{array}{c}C_{2} \\C_{1} \\C_{2} \\\vdots \\\end{bmatrix}\begin{array}{c}C_{3} \\C_{1} \\\end{array}\begin{array}{c}C_{1} \\A_{2} \\\vdots \\\end{array}\begin{bmatrix}A_{2} \\C_{1} \\\vdots \\0.98 \\\end{array}\begin{array}{c}A_{1} \\3 \\3 \\\end{array}\begin{array}{c}A_{1} \\0.17 \\3 \\0.3 \\\end{array}\begin{array}{c}A_{2} \\0.21 \\3 \\7 \\0.23 \\3 \\5 \end{array}\begin{array}{c}A_{2} \\0.16 \\0.16 \\\end{bmatrix} \end{array} \end{array} \end{array}
$$

Because $C _ { 1 }$ is a benefit criterion, $C _ { 1 } \stackrel { \mathrm { ~ \scriptsize ~ \cdot ~ } } { s }$ element normalization applies to Equation (2) $\mathbf { x _ { j } ^ { \prime } } =$ $\frac{x_{ij -} \min\limits_{i} \{ x_{ij} \}}{\max\limits_{i} \{ x_{j} \} - \min\limits_{i} \{ x_{j} \}}$ . Taking $\mathbf { d _ { 1 1 } ^ { \prime } }$ as an example, the normalized calculation formula of $\mathbf { d _ { 1 1 } ^ { \prime } }$ is as follows:

$$
\mathrm{d}_{11}^{\prime}=\frac{\mathrm{d}_{11-}\min \left\{\mathrm{d}_{1 j}\right\}}{\max \left\{\mathrm{d}_{1 j}\right\}-\min \left\{\mathrm{d}_{1 j}\right\}}=\frac{0.95-0.91}{0.98-0.91}=0.5714
$$

In the same way, to calculate the normalized values for other elements of the $D _ { E 1 }$ matrix, we obtain the matrix $\mathbf { D _ { E 1 } ^ { \prime } }$ as below:

$$
\begin{bmatrix} D_{E1}^{\prime} = \begin{array}{c}A_{1} \\A_{2} \\\vdots \\A_{5} \\\end{array}\begin{bmatrix}d_{11}^{\prime} & d_{22}^{\prime} & d_{31}^{\prime} \\d_{11}^{\prime} & d_{22}^{\prime} & d_{32}^{\prime} \\\vdots & \vdots & \vdots \\d_{15}^{\prime} & d_{25}^{\prime} & d_{35}^{\prime} \\\end{bmatrix}=\begin{array}{c}A_{1} \\A_{2} \\A_{3} \\A_{4} \\\end{bmatrix}\begin{bmatrix}0.5714 & 0.5000 & 0.4286 \\1.0000 & 0.0000 & 0.1429 \\0.2857 & 1.0000 & 0.7143 \\0.0000 & 0.3333 & 1.0000 \\0.1429 & 0.6667 & 0.0000 \\\end{bmatrix} \end{array}
$$

(2) Calculate the proportion $\mathbf { z _ { i j } }$ of the j-th criterion i-th evaluation object $\mathbf { x } _ { \mathbf { i j } } ^ { \prime } .$

According Equation (4) $\begin{array} { r } { \mathrm { z _ { i j } = \frac { x _ { i j } ^ { \prime } } { \Sigma _ { i = 1 } ^ { m } x _ { i j } ^ { \prime } } } } \end{array}$ and taking $\mathbf { z _ { 1 1 } }$ as an example, the proportion calculation formula of $\mathbf { z _ { 1 1 } }$ is as follows:

$$
\mathrm{z}_{11}=\frac{\mathrm{d}_{11}^{\prime}}{\sum_{\mathrm{i}=1}^{5} \mathrm{d}_{\mathrm{i} 1}^{\prime}}=\frac{0.5714}{0.5714+1.0000+0.2857+0.0000+0.1429}=0.2857
$$

In the same way, to calculate the proportion values for other elements of the $D _ { E 1 } ^ { \prime }$ matrix, we obtain the matrix Z as below:

$$
\begin{bmatrix} Z = \begin{array}{c}A_{1} \\A_{2} \\\vdots \\A_{5} \\\end{array}\begin{bmatrix}C_{1} & C_{2} & C_{3} \\z_{11} & z_{21} & z_{31} \\z_{12} & z_{22} & z_{32} \\\vdots & \vdots & \vdots \\z_{15} & z_{25} & z_{35} \\\end{bmatrix}=\begin{array}{c}A_{1} \\A_{2} \\A_{3} \\A_{4} \\A_{5} \\\end{bmatrix}\begin{bmatrix}0.2857 & 0.2000 & 0.1875 \\0.5000 & 0.0000 & 0.0625 \\0.1429 & 0.4000 & 0.3125 \\0.0000 & 0.1333 & 0.4375 \\0.0714 & 0.2667 & 0.0000 \\\end{bmatrix} \end{array}
$$

(3) Calculate the value of the information entropy of the j-th criterion $\mathsf { e } _ { \mathrm { j } }$

According Equation $\begin{array} { r } { ( 6 ) , \mathrm { e } _ { \mathrm { j } } = - \frac { 1 } { \ln \mathrm { m } } { \sum _ { \mathrm { i } = 1 } ^ { \mathrm { m } } \mathrm { z } _ { \mathrm { i j } } \ln \mathrm { z } _ { \mathrm { i j } } } } \end{array}$ , taking $\mathbf { e _ { 1 } }$ as an example, the proportion calculation formula of $\mathbf { e _ { 1 } }$ is as follows:

$$
\begin{aligned}\mathbf{e}_{1} = - \frac{1}{\ln 5} \sum_{\mathrm{i}=1}^{5} \mathbf{z}_{\mathrm{i}1} \ln \mathbf{z}_{\mathrm{i}1} &= - \frac{1}{\ln 5} \left( 0.2857 \times \ln 0.2857 + 0.5000 \times \ln 0.5000 + 0.1429 \times \ln 0.1429 \right. \\&\left. + 0.0000 \times \ln 0.0000 + 0.0714 \times \ln 0.0714 \right) = 0.7276\end{aligned}
$$

In the same calculation, we can obtain $\mathrm{e}_{2}=0.8137   and   \mathrm{e}_{3}=0.7533.$

(4) Calculate the information utility $\mathbf { b _ { j } }$ for the j-th criterion.

According Equation $(7)\ b_{j}=1-e_{j}$ , the information utility $\mathbf { b _ { j } }$ for the j-th criterion can be calculated as follows:

$$
\mathbf{b}_{1}=1-\mathbf{e}_{1}=1-0.7276=0.2724; \mathbf{b}_{2}=1-\mathbf{e}_{2}=1-0.8137=0.1863; \mathbf{b}_{3}=1-\mathbf{e}_{3}=1-0.7533=0.2467
$$

(5) Calculate the entropy weight $w _ { \mathrm { j } }$ of the j-th criterion.

According Equation (8) $\begin{array} { r } { \mathbf { w _ { \mathrm { e j } } } = \frac { \mathbf { b _ { \mathrm { j } } } } { \Sigma _ { \mathrm { j = 1 } } ^ { \mathrm { n } } \mathbf { b _ { \mathrm { j } } } } , } \end{array}$ the entropy weight $w _ { \mathrm { j } }$ of the j-th criterion can be calculated as follows:

$$
w_{\mathrm{e}1}=\frac{b_{1}}{\sum_{\mathrm{j}=1}^{3}b_{\mathrm{j}}}=\frac{0.2724}{0.2724+0.1863+0.2467}=0.3862
$$

$$
w_{\mathrm{e}2}=\frac{b_{2}}{\sum_{\mathrm{j}=1}^{3}b_{\mathrm{j}}}=\frac{0.1863}{0.2724+0.1863+0.2467}=0.2641
$$

$$
w_{\mathrm{e}3}=\frac{b_{3}}{\sum_{\mathrm{j}=1}^{3}b_{\mathrm{j}}}=\frac{0.2647}{0.2724+0.1863+0.2467}=0.3497
$$

Following the same process, the entropy weights of the other three categories can also be calculated. $\mathsf { S o } ,$ the weights of the criterion and facet for evaluating building material supplier selection with the entropy method are expressed in Table 2.

Table 2. Weights of various facets and criteria for building material supplier selection evaluated with the entropy method.

<table><tr><td rowspan=14 colspan=2>SuitablesupplierselectionCagegory 4</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td>Facet forthe firstlayer</td><td>Facetweight $\bf { \big ( ^ { 1 } W _ { e i } \big ) }$ </td><td>Criterion (indicator) forthe second layer</td><td>Dimension</td><td>Indicatorweight $\mathrm { ~ ( ~ } ^ { 2 } \mathbf { W _ { e j } } \mathrm { ) ~ }$ </td><td colspan=2>Totalweight $( \pmb { w } _ { e j } = \mathbf { \Sigma ^ { 1 } } \pmb { w } _ { \mathrm { e i } }$  $\times ^ { 2 } \mathbf { w _ { e j } } )$ </td><td rowspan=4></td></tr><tr><td rowspan=5>Productsatisfaction(A)</td><td rowspan=5>0.4426</td><td>A1.Rate of qualifiedproducts</td><td>positive</td><td>0.3862</td><td colspan=2>0.1709</td></tr><tr><td>A2.Product price(thousand dollars)</td><td>negative</td><td>0.2641</td><td colspan=2>0.1169</td></tr><tr><td rowspan=2>A3.Rate of Productmarket share</td><td rowspan=2>positive</td><td rowspan=2>0.3497</td><td rowspan=2 colspan=2>0.1548</td><td>1548</td></tr><tr><td rowspan=4 colspan=2>Category 1</td></tr><tr><td colspan=2>Subtotal</td><td></td><td colspan=2></td></tr><tr><td rowspan=3>Supplyinnovationcapability(B)</td><td rowspan=3>0.2592</td><td>B1.Supply capacity (kgtime)</td><td>positive</td><td>0.4658</td><td colspan=2>0.1207</td></tr><tr><td>B2.New productdevelopment rate (%)</td><td>positive</td><td>0.5342</td><td rowspan=5 colspan=3>0.1385Category 20.1739Category 3</td></tr><tr><td colspan=2>Subtotal</td><td></td><td colspan=2></td></tr><tr><td rowspan=4>Servicelevel(C)</td><td rowspan=4>0.2982</td><td>C1. Delivery time (days)</td><td>negative</td><td>0.4168</td><td colspan=2>0.1243</td></tr><tr><td>C2.Delivery on time ratio(%)</td><td>positive</td><td>0.5832</td></tr><tr><td rowspan=2 colspan=2>Subtotal</td><td rowspan=2>1</td><td rowspan=2 colspan=2></td></tr><tr><td>---</td><td></td></tr></table>

The entropy weight $\left( \mathbf { \nabla } ^ { 1 } \mathbf { W _ { \mathrm { e i } } } \right)$ of the facet can be obtained as follows:

wei1 = ( we11, we21, we31) = (0.4426, 0.2592,0.2982)

The entropy weight $\mathrm {  ~ \left( ~ ^ 2 w _ { e j } \right) } \mathrm { o f }$ the criterion can be obtained as follows:

wej2 = ( we12, we22, … , we72) = (0.3862, 0.2641,0.3497,0.4658,0.5342,0.4168,0.5832)

Step 4: Calculating the weight of each criterion using the AHP method.

Assuming that some decision makers and experts follow the steps of the 2.2.3 AHP method, the weights and indicators for evaluating various aspects of building material supplier selection with the AHP method are listed in Table 3.

Table 3. Weights of various facets and the criterion of building material supplier selection evaluated with the [analytic hierarchy process](https://en.wikipedia.org/wiki/Analytic_hierarchy_process) (AHP) method.

<table><tbody><tr><td>Main target</td><td>Facet for the first layer</td><td>Facetw(e<sup>𝟏</sup>𝐰ig<sub>𝐡</sub>h<sub>𝐢</sub>)t</td><td>Criterion (indicator) for the second layer</td><td>Dimension</td><td>Indicat or w( <sup>𝟐</sup>e𝐰ig<sub>𝐡</sub>h<sub>𝐣</sub>)t</td><td>Total weight(×𝒘𝒉𝟐𝒋𝐰=𝐡𝐣𝟏)𝐰𝐡𝐢</td></tr><tr><td rowspan="3">Suitable supplier selection</td><td rowspan="3">Product satisfaction (A)</td><td rowspan="3">0.3916</td><td>A1. Rate of qualified products</td><td>positive</td><td>0.4125</td><td>0.1615</td></tr><tr><td>A2.Product price (thousand dollars)</td><td>negative</td><td>0.3759</td><td>0.1472</td></tr><tr><td>A3.Rate of Product</td><td>positive</td><td>0.2116</td><td>0.0829</td></tr><tr><td rowspan="8"></td><td rowspan="2"></td><td rowspan="2"></td><td>market share</td><td></td><td></td><td></td></tr><tr><td colspan="2">Subtotal</td><td>1</td><td>---</td></tr><tr><td rowspan="3">Supply innovation capability (B)</td><td rowspan="3">0.2815</td><td>B1.Supply capacity (kg / time)</td><td>positive</td><td>0.5293</td><td>0.1490</td></tr><tr><td>B2.New product development rate (%)</td><td>positive</td><td>0.4707</td><td>0.1325</td></tr><tr><td colspan="2">Subtotal</td><td>1</td><td>---</td></tr><tr><td rowspan="3">Service level (C)</td><td rowspan="3">0.3269</td><td>C1. Delivery time (days)</td><td>negative</td><td>0.3917</td><td>0.1280</td></tr><tr><td>C2. Delivery on time ratio (%)</td><td>positive</td><td>0.6083</td><td>0.1989</td></tr><tr><td colspan="2">Subtotal</td><td>1</td><td>---</td></tr></tbody></table>

The AHP weight $\big ( \mathrm {  ~ ^ { 1 } w _ { h i } } \big )$ of the facet in the first layer can be obtained as follows: $\left( \mathrm {  ~ ^ { 1 } w _ { h i } } \right) = \left( \mathrm {  ~ ^ { 1 } w _ { h 1 } , ~ ^ { 1 } w _ { h 2 } , ~ ^ { 1 } w _ { h 3 } } \right) = \left( 0 . 3 9 1 6 , 0 . 2 8 1 5 , 0 . 3 2 6 9 \right)$

The AHP weights $\big ( \mathrm {  ~ ^ { 2 } w _ { h j } } \big )$ of criteria in second layer can be obtained as below:

w<sub>hj</sub><sup>2</sup> = ( wh12, wh22, … , wh72) = (0.4125, 0.3759,0.2116,0.5293,0.4707,0.3917,0.6083)

Step 5: Determining the combination weights of the criteria.

According to the Equation (17) $\begin{array} { r } { w _ { c j } = \frac { w _ { e j \times } w _ { h j } } { \Sigma _ { j = 1 } ^ { n } w _ { e j } \times w _ { h j } } } \end{array}$ , where $w _ { e j }$ is the objective weight calculated by entropy and $w _ { h j }$ is the subjective weight derived from the AHP method, then the combination weight $\big ( \mathrm {  ~ ^ { 1 } ~ } { \cal W } _ { \mathrm { c i } }$ and $^ 2 \mathbf { W } _ { \mathrm { c i } } )$ of each criterion can be obtained by using the combination weighting method, as expressed in Table 4 and Table 5.

Table 4. Facet weights of building material supplier selection evaluated with the combination weighting method.

| Weight item | Product satisfaction (A) | Supply innovation capability (B) | Service level (C) |
| --- | --- | --- | --- |
| Entropy weight ( <sup>1</sup>w<sub>ei</sub>) | 0.4426 | 0.2592 | 0.2982 |
| AHP weight ( <sup>1</sup>w<sub>hi</sub>) | 0.3916 | 0.2815 | 0.3269 |
| Combination weight |  |  |  |
| ( 1wci = ∑3𝑖=11w1ewi×ei1×w1hwihi) | 0.5042 | 0.2122 | 0.2836 |

The combination weight $\big ( \mathrm {  ~ ^ { 1 } W _ { c i } } \big )$ of the facet in first layer can be obtained as follows:

$$
\left( \mathrm {  ~ ^ { 1 } w _ { c i } } \right) = \left( \mathrm {  ~ ^ { 1 } w _ { c 1 } , ~ ^ { 1 } w _ { c 2 } , ~ ^ { 1 } w _ { c 3 } } \right) = \left( 0 . 5 0 4 2 , 0 . 2 1 2 2 , 0 . 2 8 3 6 \right)
$$

Table 5. Criterion weights of building material supplier selection evaluated by the combination weighting method.

| Weight item | Rate of qualified products (A1) | Product price (thousan d dollars) (A2) | Rate of Product market share (A3) | Supply capacity (kg/ time) (B1) | New product develop ment rate (%) | Delivery time (days) (C1) | Delivery on time ratio (%) (C2) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Entropy weight $\big ( \mathbf { \nabla } ^ { 2 } \mathbf { W _ { \mathrm { e j } } } \big )$ | 0.3862 | 0.2641 | 0.3497 | 0.4658 | (B2) 0.5342 | 0.4168 | 0.5832 |
| AHP weight $\big ( \mathrm { ~ ^ { 2 } w _ { h j } } \big )$ | 0.4125 | 0.3759 | 0.2116 | 0.5293 | 0.4707 | 0.3917 | 0.6083 |
| Combination weight $\mathrm{(~^{2}w_{cj}=\frac{^{2}w_{cj}\times^{2}w_{hj}}{\sum_{j=1}^{7}^{2}w_{cj}\times^{2}w_{hj}})}$ | 0.4789 | 0.2985 | 0.2225 | 0.4951 | 0.5049 | 0.3152 | 0.6848 |

The combination weights $\big ( \mathbf { \nabla } ^ { 2 } \mathbf { W _ { c j } } \big )$ of criteria in second layer can be obtained as below:

wcj2 = ( wc12, wc22, … , wc72) = (0.4789, 0.2985,0.2225,0.4951,0.5049,0.3152,0.6848)

Step 6: Establishing the entropy-AHP weight of the decision matrix.

Based on Tables 4 and $5 ,$ and by Equation (18), $\mathrm{W_{cj}=^{1}W_{ci}\times^{2}W_{cj}}$ , Table 6 showed the entropy-AHP weight $\left( \mathbf { w } _ { \mathrm { c j } } \right)$ of the decision matrix.

Table 6. The entropy-AHP weight $( \mathbf { w } _ { \mathrm { c j } } )$ calculated by the combination weighting method.

| Main | Facet for | Facet | Criterion (indicator) | Dimensio | Indicator | Total weight |
| --- | --- | --- | --- | --- | --- | --- |
| target | the first layer | w( <sup>𝟏</sup>e𝐰ig<sub>𝐜</sub>h<sub>𝐢</sub>)t | for the second layer | n | w(e<sup>𝟐</sup>i𝐰gh<sub>𝐜𝐣</sub>t) | (𝒘E𝒄n𝒋=tr𝟏o𝐰p𝐜y𝐢-×AH𝟐𝐰P𝐜𝐣) |
| Suitable | Product | 0.5042 | A1.Rate of qualified | positive | 0.4790 | 0.2415 |
| supplier | satisfaction (A) |  | products |  |  |  |
| selection |  |  | A2.Product price | negative | 0.2985 | 0.1505 |
|  |  |  | (thousand dollars) |  |  |  |
|  |  |  | A3.Rate of Product | positive | 0.2225 | 0.1122 |
|  |  |  | market share |  |  |  |
|  |  |  | Subtotal |  | 1 | --- |
|  | Supply | 0.2122 | B1.Supply capacity (kg | positive | 0.4951 | 0.1051 |
|  | innovation capability |  | / time) |  |  |  |
|  | (B) |  | B2.New product | positive | 0.5049 | 0.1071 |
|  |  |  | development rate |  |  |  |
|  |  |  | (%) |  |  |  |
|  |  |  | Subtotal |  | 1 | --- |
|  | Service | 0.2836 | C1. Delivery time | negative | 0.3152 | 0.0894 |
|  | level© |  | (days) |  |  |  |
|  |  |  | C2. Delivery on time | positive | 0.6848 | 0.1942 |
|  |  |  | ratio (%) |  |  |  |
|  |  |  | Subtotal |  | 1 | --- |

We can obtain the entropy-AHP weight $( w _ { c j } )$ of each criterion using the equation listed below: <sup>𝑤</sup>𝑐𝑗 = (w<sub>𝑐1</sub>, w<sub>𝑐2</sub>, … , w<sub>𝑐7</sub>) = (0.2415, 0.1505,0.1122,0.1051,0.1071,0.0894,0.1942)

Step 7: Building the combination weighting normalization decision matrix.

The combination weighting normalization decision matrix using Equation (19) and Equation (20), $\mathbf { u } _ { i j } = w _ { c j } \times p _ { i j } ,$ , can be expressed as follows:

<table><tr><td rowspan="2"> $\mathbf { u } = { \begin{array} { r } { \mathbf { A } _ { 1 } } \\ { \mathbf { A } _ { 2 } } \\ { \vdots } \\ { \mathbf { A } _ { 5 } } \end{array} } { \begin{array} { r } { \left[ \begin{matrix} { \mathtt { C } _ { 1 } } & { \mathtt { C } _ { 2 } } & { \dots } & { \mathtt { C } _ { 7 } } \\ { \mathtt { u } _ { 1 1 } } & { \mathtt { u } _ { 1 2 } } & { \dots } & { \mathtt { u } _ { 1 7 } } \\ { \mathtt { u } _ { 2 1 } } & { \mathtt { u } _ { 2 2 } } & { \dots } & { \mathtt { u } _ { 2 7 } } \\ { \vdots } & { \vdots } & { \ddots } & { \vdots } \\ { \mathtt { u } _ { 5 1 } } & { \mathtt { u } _ { 5 2 } } & { \dots } & { \mathtt { u } _ { 5 7 } } \end{matrix} \right] } \end{array} } { \begin{array} { r } { \mathbf { A } _ { 1 } } \\ { \mathbf { A } _ { 2 } } \\ { \mathbf { A } _ { 3 } } \\ { \mathbf { A } _ { 4 } } \\ { \mathbf { A } _ { 5 } } \end{array} }$ </td><td rowspan="2"></td><td rowspan="2"></td><td rowspan="2"></td><td rowspan="2"></td><td rowspan="2"></td><td rowspan="2"> $\mathsf { C _ { 1 } }$ </td><td rowspan="2"> $\complement _ { 2 }$ </td><td rowspan="2"> $\complement _ { 3 }$ </td><td rowspan="2"> $\mathsf { C } _ { 4 }$ </td><td rowspan="2"> $\complement _ { 5 }$ </td><td rowspan="2"> $\complement _ { 6 }$ </td><td rowspan="2"> $\complement _ { 7 }$ </td></tr><tr><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td><td></td><td>0.0489</td><td>0.0224</td><td>0.0298</td><td>0.0207</td><td>0.0211</td><td>0.0173</td><td>0.04041</td></tr><tr><td></td><td></td><td></td><td></td><td></td><td></td><td>0.0505 0.0479</td><td>0.0326 0.0276</td><td>0.0267 0.0329</td><td>0.0203 0.0223</td><td>0.0217 0.0200</td><td>0.0204 0.0173</td><td>0.0387 0.0400</td></tr><tr><td></td><td></td><td></td><td></td><td></td><td></td><td>0.0468</td><td>0.0309</td><td>0.0361</td><td>0.0219</td><td>0.0223</td><td>0.0188</td><td>0.0378</td></tr><tr><td></td><td></td><td></td><td></td><td></td><td></td><td>L0.0474</td><td>0.0293</td><td>0.0251</td><td>0.0199</td><td>0.0220</td><td>0.0157</td><td>0.0374</td></tr></table>

Step 8: Acquire the solutions of the positive-ideal (PI) and the negative-ideal (NI).

The 7 criteria are classified as benefit criteria or cost criteria. “Rate of qualified products”, “Rate of Product market share”, “Supply capacity $(\mathrm{kg/time})^{\prime\prime}$ , “New product development rate $( \% ) ^ { \prime \prime } ,$ and “Delivery on time ratio $\left( \% \right) ^ { \prime \prime }$ are benefit criteria $\mathbb { B } = \{ C _ { 1 } , C _ { 3 } , C _ { 4 } , C _ { 5 } , C _ { 7 } \} ,$ however, “Product price (thousand dollars)” and “Delivery time $( \mathrm { d a y s } ) ^ { \prime \prime }$ are cost criteria $\mathbb { C }   =   \{ \mathbb { C } _ { 2 } ,   \mathbb { C } _ { 6 } \}$ . Then, we get the positive ideal (PI) and negative ideal (NI) solutions as follows:

$$
A ^ { + } = \{ 0 . 0 5 0 5 { , } 0 . 0 2 2 4 { , } 0 . 0 3 6 1 { , } 0 . 0 2 2 3 { , } 0 . 0 2 2 3 { , } 0 . 0 1 5 7 { , } 0 . 0 4 0 4 \}
$$

$$
A ^ { - } = \{ 0 . 0 4 6 8 { , } 0 . 0 3 2 6 { , } 0 . 0 2 5 1 { , } 0 . 0 1 9 9 { , } 0 . 0 2 0 0 { , } 0 . 0 2 0 4 { , } 0 . 0 3 7 4 \}
$$

Step 9: Measure the Euclidean distance from PI solution (PIS) and NI solution (NIS).

Based on the normalized Euclidean distance, distance measurement of both positive and negative solutions for each alternative by Equation (23) $\begin{array} { r } { \mathsf { S } ^ { + } = \sqrt { \sum _ { \mathbf { j } = 1 } ^ { \mathbf { n } } ( \mathsf { u } _ { \mathbf { i j } } - \mathsf { u } _ { \mathbf { i j } } ^ { + } ) ^ { 2 } } . } \end{array}$ and Equation (24) $\begin{array} { r } { \mathrm { S ^ { - } } = \sqrt { \sum _ { \mathrm { j = 1 } } ^ { \mathrm { n } } ( \mathrm { u _ { i j } - u _ { i j } ^ { - } } ) ^ { 2 } } . } \end{array}$ are given in Tables 7 and 8.

Table 7. Euclidean distance measures from the positive-ideal solution (PIS).

| Alternatives | 𝐀<sub>𝟏</sub> | 𝐀<sub>𝟐</sub> | 𝐀<sub>𝟑</sub> | 𝐀<sub>𝟒</sub> | 𝐀<sub>𝟓</sub> |
| --- | --- | --- | --- | --- | --- |
| S+ | 0.0069 | 0.0149 | 0.0071 | 0.0101 | 0.0138 |

Table 8. Euclidean distance measures from the negative-ideal solution (NIS).

| Alternatives | 𝐀<sub>𝟏</sub> | 𝐀<sub>𝟐</sub> | 𝐀<sub>𝟑</sub> | 𝐀<sub>𝟒</sub> | 𝐀<sub>𝟓</sub> |
| --- | --- | --- | --- | --- | --- |
| S- | 0.0123 | 0.0045 | 0.0105 | 0.0116 | 0.0061 |

Step 10: Calculate the Relative Proximity of PIS.

Relative proximity of an alternative $\mathrm { A _ { i } }$ with regard to the positive-ideal solution (PIS) by Equation (25) $\begin{array} { r } { \varphi _ { \mathrm { i } } = \frac { S ^ { - } } { S ^ { + } + S ^ { - } } } \end{array}$ is shown in Table 9 and Figure 4. It can be seen from Figure 4 that the closer the proximity is to 1, the higher the overall performance of the supplier to be selected—that is, the most suitable supplier.

Table 9. Relative proximity of the alternatives.

| Alternatives | 𝐀<sub>𝟏</sub> | 𝐀<sub>𝟐</sub> | 𝐀<sub>𝟑</sub> | 𝐀<sub>𝟒</sub> | 𝐀<sub>𝟓</sub> |
| --- | --- | --- | --- | --- | --- |
| φ<sub>i</sub> | 0.6395 | 0.2326 | 0.5946 | 0.5350 | 0.3074 |

![](images/page_17_chart_2.jpg)

Figure 4. Comprehensive proximity of supplier alternatives.

Step 11: Ranking the Options.

Based on the relative proximity of each alternative, and then options were ranked according to the descending order of $\varphi _ { \mathrm { i } } .$ As shown in Table 10, the five options were ranked in order as $\mathrm { A _ { 1 } } >$ $\mathrm{A}_{3}>\mathrm{A}_{4}>\mathrm{A}_{5}>\mathrm{A}_{2}.$ <sub>1</sub> was selected as a suitable supplier of building materials in five alternatives.

Table 10. The ranking of the options.

| Options | 𝐀<sub>𝟏</sub> | 𝐀<sub>𝟐</sub> | 𝐀<sub>𝟑</sub> | 𝐀<sub>𝟒</sub> | 𝐀<sub>𝟓</sub> |
| --- | --- | --- | --- | --- | --- |
| Rank | 1 | 5 | 2 | 3 | 4 |

## 5. Results and Discussion

In the multi-criteria evaluation method, a sensitivity analysis must be performed at the final stage in order to analyze the relationship between the weight of the alternatives and the proximity of TOPSIS. We will perform a sensitivity analysis and discuss the findings of this article in this section. From the 2nd to 4th stages of the research framework, the entropy-AHP weight value of TOPSIS can be obtained, which can appropriately replace the subjective weight value set by decision makers in the traditional TOPSIS method. The value of the obtained entropy-AHP weight vector is $w_{cj} = (w_{c1}, w_{c2}, \ldots, w_{c7}) = (0.2415, 0.1505, 0.1122, 0.1051, 0.1071, 0.0894, 0.1942 )$ . This means that the individual impact of each criterion on alternatives is 24.15%, 15.05%, 11.22%, 10.5%, 10.71%, 8.94%, and 19.42%, respectively. The combination of objective weight (entropy) and subjective weight (AHP) can reduce the bias of subjective weights and truly reflect the current situation. In the third phase, the TOPSIS method is improved by using the entropy-AHP weight, and a novel entropy-AHP weighted TOPSIS model is established.

In addition, based on the novel entropy-AHP TOPSIS model, the value of the evaluation index φ represents the relative advantage of each alternative. We can rank the alternatives in the order of A1, A3, A4, A5, and A2 according to the φ value from high to low. The suitable supplier was finally determined to be A1.

From the results, it can be seen that the research framework proposed in this paper has the advantage of choosing suitable alternatives and providing a reference value for decision makers. To verify the stability and robustness of the novel evaluation model, a systematic sensitivity analysis was performed and compared with the AHP-based TOPSIS model.

According Table 4 and Table 5, the facets and indicator weights belonging to AHP-based TOPSIS and entropy-AHP TOPSIS can be shown as Table 11 and Table 12.

Table 11. Facet weights of AHP-based technique for order preference by similarity to an ideal solution (TOPSIS) and entropy-AHP TOPSIS.

| Product satisfaction | Supply innovation |
| --- | --- |
| MCDM method | Service level (C) |
| (A) | capability (B) |
| AHP-based TOPSIS 0.3916 | 0.2815 0.3269 |
| Entropy-AHP TOPSIS 0.5042 | 0.2122 0.2836 |

Table 12. Indicator weights of AHP-based TOPSIS and entropy-AHP TOPSIS.

| MCDM method | Rate of qualified products(A1) | Product price (thousan d dollars)(A2) | Rate of Product market share(A3) | Supply capacity (kg/ time) (B1) | New product develop ment rate (%) (B2) | Delivery time (days)(C1) | Delivery on time ratio (%) (C2) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| AHP-based TOPSIS | 0.4125 | 0.3759 | 0.2116 | 0.5293 | 0.4707 | 0.3917 | 0.6083 |
| Entropy-AHP TOPSIS | 0.4790 | 0.2985 | 0.2225 | 0.4951 | 0.5049 | 0.3152 | 0.6848 |

First, explore the correspondence between the relative proximity of alternatives in entropy-AHP TOPSIS and AHP-based TOPSIS when the weights of facet A, B, C changes within the range of - $\begin{array} { r } { \mathopen { } \mathclose \bgroup \vert \mathclose \bgroup  - 4 0 \% , \mathclose \bgroup  . . . , 4 0 \% , \mathclose \bgroup  \aftergroup \egroup   \aftergroup  - 4 0 \% , \mathclose \bgroup  . . . , 4 0 \% , \aftergroup \egroup    \aftergroup  \aftergroup  - 4 0 \% , \mathclose \bgroup  . . . , 4 0 \% , \aftergroup  . . . , \aftergroup  \aftergroup  \aftergroup  \aftergroup  \aftergroup  \aftergroup \egroup   \aftergroup   \aftergroup  \aftergroup  \aftergroup  \aftergroup  \aftergroup  \aftergroup  \aftergroup  \aftergroup  \aftergroup  \aftergroup  \aftergroup  \aftergroup   \aftergroup  \aftergroup   \aftergroup   \aftergroup   \aftergroup   \aftergroup   \aftergroup    \aftergroup    \aftergroup      }                           }                                                                                                                                                                                                                                 \ \end{array}$ 50% , shown as Table 13 and Figure 5. Based on this, it can be seen that the ranking of each alternative has not changed, indicating that the value of the facet weight does not affect the ranking of alternatives.

Table 13. Sensitivity analysis of the facet A weight $( ^ { 1 } \mathrm { w } _ { \mathrm { h } 1 } \mathrm { i n } ^ { 1 } \mathrm { w } _ { \mathrm { c } 1 } )$ to the outcome of the alternatives. in entropy-AHP TOPSIS.

|  | <sup>1</sup>w<sub>h1</sub> =-𝟓𝟎% | <sup>1</sup>w<sub>h1</sub> =-𝟒𝟎% | <sup>1</sup>w<sub>h1</sub> =-𝟑𝟎% | 1w<sub>h1</sub> =- 𝟐𝟎% | <sup>1</sup>w<sub>h1</sub> =-𝟏𝟎% | <sup>1</sup>w<sub>h1</sub> =𝟎 | <sup>1</sup>w<sub>h1</sub>= 𝟏𝟎% | 1w<sub>h1</sub> =𝟐𝟎% | 1w<sub>h1</sub> =𝟑𝟎% | 1w<sub>h1</sub> =𝟒𝟎% | 1w<sub>h1</sub> =𝟓𝟎% |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A<sub>1</sub> | 0.6406 | 0.6402 | 0.6400 | 0.6398 | 0.6396 | 0.6395 | 0.6394 | 0.6393 | 0.6392 | 0.6392 | 0.6406 |
| A<sub>2</sub> | 0.2423 | 0.2391 | 0.2367 | 0.2350 | 0.2336 | 0.2326 | 0.2317 | 0.2310 | 0.2304 | 0.2299 | 0.2423 |
| A<sub>3</sub> | 0.6000 | 0.5982 | 0.5969 | 0.5959 | 0.5952 | 0.5946 | 0.5941 | 0.5937 | 0.5934 | 0.5931 | 0.6000 |
| A<sub>4</sub> | 0.5247 | 0.5283 | 0.5308 | 0.5326 | 0.5339 | 0.5350 | 0.5359 | 0.5366 | 0.5371 | 0.5376 | 0.5247 |
| A<sub>5</sub> | 0.3664 | 0.3483 | 0.3343 | 0.3234 | 0.3146 | 0.3074 | 0.3014 | 0.2964 | 0.2921 | 0.2884 | 0.3664 |

And from the perspective of the best choice, no matter how the standard weight changes, the most suitable choice is still $\mathrm { A _ { 1 } }$

![](images/page_18_chart_10.jpg)

![](images/page_18_chart_11.jpg)

(a) Fluctuation of the facet A weight $( ^ { 1 } \mathrm { w } _ { \mathrm { h } 1 } \mathrm { i n } ^ { 1 } \mathrm { w } _ { \mathrm { c } 1 } )$ to the outcome of the alternatives in entropy-AHP TOPSIS.

(d) Fluctuation of the facet A weight $\big ( \mathrm {  ~ ^ { 1 } { w } _ { h 1 } } \big )$ to the outcome of the alternatives in AHP-based TOPSIS.

![](images/page_19_chart_2.jpg)

![](images/page_19_chart_3.jpg)

(e) Fluctuation of the facet B weight $\big ( \mathrm {  ~ ^ { 1 } { w } _ { h 2 } } \big )$ to the outcome of the alternatives in AHP-based TOPSIS.

(b) Fluctuation of the facet B weight $( ^ { 1 } \mathrm { w } _ { \mathrm { h } 2 } \mathrm { i n } ^ { 1 } \mathrm { w } _ { \mathrm { c } 2 } )$ to the outcome of the alternatives in entropy-AHP TOPSIS.

![](images/page_19_chart_6.jpg)

(c) Fluctuation of the facet C weight $( ^ { 1 } \mathrm { w } _ { \mathrm { h } 3 } \mathrm { i n } ^ { 1 } \mathrm { w } _ { \mathrm { c } 3 } )$ to the outcome of the alternatives in entropy-AHP TOPSIS.

![](images/page_19_chart_8.jpg)

(f) Fluctuation of the facet C weight $\big ( \mathrm {  ~ ^ { 1 } { w } _ { h 3 } } \big )$ to the outcome of the alternatives in AHP-based TOPSIS.

Figure 5. Sensitivity analysis of the facet weight to the outcome of the alternatives. ntropy-AHP TOPSIS vs. AHP-based TOPSIS.

Comparing the sensitivity analysis of the results of entropy-AHP TOPSIS [Figures 5. (a), (b), (c)] and AHP-based TOPSIS [Figures 5. (d), (e), (f)], we can know that ntropy-AHP TOPSIS is an effective and more stable evaluation model in selecting a building material supplier than AHP-based TOPSIS.

In summary, the sensitivity analysis proves that the evaluation results of the novel evaluation model established are valid and reliable. Through the sensitivity analysis of building material suppliers, the effectiveness, feasibility, and stability of the novel multi-criteria evaluation model for solving the MCDM problems are verified.

## 6. Conclusions

The aim of this research is to develop a novel entropy-AHP weighted TOPSIS model to evaluate the building material supplier selection from a theoretical and practical perspective. This paper describes how to comprehensively and systematically construct an entropy-AHP weighted TOPSIS method. From the suggested methods, Entropy, AHP, and TOPSIS are utilized to achieve research purposes. The findings and particular advantages of research indicate as follow:

The entropy-AHP weight value can be a suitable substitute for the weight value determined subjectively by decision makers in the TOPSIS method. Decision makers can more comprehensively and scientifically evaluate potential suppliers based on aggregating Entropy objective and AHP subjective weights into one comprised weight.

The combination of the weights between different layers of Entropy and AHP needs to be calculated separately. After combining the weights of each layer, the weights of different layers are then multiplied to obtain the total weight value (entropy-AHP weight).

Compared with the AHP-based TOPSIS model, the selection result of this novel evaluation model is effective, reliable and more stable.

In addition, throughout the research process and results, the contributions of this paper can mainly be expressed as below:

To combine entropy weight, AHP, and TOPSIS methods into a suitable MCDM solution. Provide effective information when decision makers are in an environment with insufficient information and strong subjective consciousness.

With a compromise weight combining objective weight (Entropy weight) and subjective weight (AHP weight), to replace the subjective weight directly set by the decision maker in the TOPSIS method. To put it another way, using entropy-AHP weights instead of subjective weights can reduce biases that may be caused only by subjective and conscious judgments.

To extend the TOPSIS method by entropy-AHP weights. That means the functionality of the TOPSIS method is extended based on the entropy-AHP weights. According to the combined weights, a normalized weight matrix and the relative proximity are calculated. Relative proximity values are used as the basis for proper supplier selection.

The theory and practice of the TOPSIS method based on entropy AHP weights have great opportunities for successful application in multi-criteria decision making because it complements and improves the subjective opinions of decision makers. The novel multi-criteria evaluation model can deal with related issues in the field of multi-criteria decision making, such as location selection, construction schemes, and many other disciplines governing decision making. The conclusions obtained in this study have taken us an important step forward, allowing us to use the Entropy-AHP weighted TOPSIS model more practically in the future.

**Funding:** This research received no external funding.

**Conflicts of Interest:** The author declares no conflict of interest.

## References

1. Chen, C.-H. A new multi-criteria assessment model combining GRA techniques with intuitionistic fuzzy entropy-based TOPSIS method for sustainable building materials supplier selection. Sustainability 2019, 11(2265), 1–18.

2. Chen, C.-H. Application enterprise architecture and TOPSIS evaluation methods for decision optimization of real estate investment projects. In Proceedings of the 2015 Corporate Architecture and Information Technology Seminar, Takming University of Science and Technology, Taipei , Taiwan, 31 October 2015; A:1–8.

3. Chou, S.Y.; Chang, Y.H. A decision support system for supplier selection based on a strategy-aligned fuzzy SMART approach. Expert Syst. Appl. 2008, 34, 2241–2253.

4. Ha, S.H.; Krishnan, R. A hybrid approach to supplier selection for the maintenance of a competitive supply chain. Expert Syst. Appl. 2008, 34, 1303–1311.

5. Stevenson, W.J. Operations Management; McGraw-Hill: New York, NY, USA, 2005.

6. Heizer, J.; Render, B. Principles of Operations Management; Prentice-Hall: Upper Saddle River, NJ, USA, 2004.

7. Simchi-Levi, D.; Kaminsky, P.; Simchi-Levi, E. Designing and Managing the Supply Chain: Concepts, Strategies, and Case Studies; McGraw-Hill: New York, NY, USA, 2003.

8. Monczka, R.; Trent, R.; Handfield, R. Purchasing and Supply Chain Management, 2nd ed.; South-Western College Publishing: Cincinnati, OH, USA, 2001.

9. Stojić, G.; Stević, Ž.; Antuchevičienė, J.; Pamučar, D.; Vasiljević, M. A novel rough WASPAS approach for supplier selection in a company manufacturing PVC carpentry products. Information 2018, 9, 1–16.

10. Cakravasia, A.; Takahashi, K. Integrated model for supplier selection and negotiation in a make-to-order environment. Int. J. Prod. Res. 2004, 42, 4457–4474.

11. Porter, M.E.; Millar, V.E. How information gives you competitive advantage. Harv. Bus. Rev. 1985, 63, 149–160.

12. Giunipero, L.C.; Brand, R.R. Purchasing’s role in supply chain management. Int. J. Logist. Manag. 1996, 7, 29–38.

13. Haq, A.N.; Kannan, G. Fuzzy analytical hierarchy process for evaluating and selecting a vendor in a supply chain model. Int. J. Adv. Manuf. Tech. 2006, 29, 826–835.

14. Barbarosoglu, G.; Yazgac, T. An application of the analytic hierarchy process to the supplier selection problem. Prod. Inv. Manag. J. 1997, 38, 14–21.

15. Nydick, R.L.; Hill, R.P. Using the Analytic Hierarchy Process to structure the supplier selection procedure. Int. J. Purch. Mater. Manag. 1992, 28, 31–36.

16. Soukup, W.R. Supplier selection strategies. J. Purch. Mater. Manag. 1987, 23, 7–12.

17. Thompson, K. Vendor profile analysis. J. Purch. Mater. Manag. 1990, 26, 11–18.

18. Gregory, R.E. Source selection: A matrix approach. J. Purch. Mater. Manag. 1986, 22, 24–29.

19. Timmerman, E. An approach to vendor performance evaluation. J. Purch. Supply Manag. 1986, 1, 27–32.

20. Zenz, G. Purchasing and the Management of Materials; Wiley: New York, NY, USA, 1981.

21. Tong, L.; Pu, Z.; Ma, J. Maintenance supplier evaluation and selection for safe and sustainable production in the chemical industry: A case study. Sustainability 2019, 11, 1–15.

22. Guo, Z.; Liu, H.; Zhang, D.; Yang, J. Green supplier evaluation and selection in apparel manufacturing using a fuzzy multi-criteria decision-making approach. Sustainability 2017, 9, 650.

23. Ghorabaee, K.M.; Amiri, M.; Zavadskas, E.K.; Antucheviciene, J. Supplier evaluation and selection in fuzzy environment: A review of MADM approaches. Econ. Res. 2017, 30, 1073–1118.

24. Shi, H.; Quan, M.Y.; Liu, H.C.; Duan, C.Y. A novel integrated approach for green supplier selection with interval-valued intuitionistic uncertain linguistic information: A case study in the agri-food industry. Sustainability 2018, 10, 733.

25. Zhang, D.; Zhang, J.; Lai, K.K.; Lu, Y. A novel approach to supplier selection based on vague sets group decision. Expert Syst. Appl. 2009, 36, 9557–9563.

26. Chen, C.T.; Lin, C.T.; Huang, S.F. A fuzzy approach for supplier evaluation and selection in supply chain management. Int. J. Prod. Econ. 2006, 102, 289–301.

27. De Boer, L.; Van der Wegen, L.; Telgen, J. Outranking methods in support of supplier selection. Eur. J. Purch. Supply Manag. 1998, 4, 109–118.

28. Hwang, C.L.; Yoon, K. Multiple Attribute Decision Making: Methods and Applications; Springer: New York, NY, USA, 1981.

29. Sirisawat, P.; Kiatcharoenpol, T. Fuzzy AHP-TOPSIS approaches to prioritizing solutions for reverse logistics barriers. Comput. Ind. Eng. 2018, 117, 303–318.

30. Pérez-Domínguez, L.; Luviano-Cruz, D.; Valles-Rosales, D.; Hernández, J.I.H.; Borbón, M.I.R. Hesitant Fuzzy Linguistic Term and TOPSIS to Assess Lean Performance. Appl. Sci. 2019, 9, 1–13.

31. Olson, D.L. Comparison of weight in TOPSIS models. Math. Comput. Model. 2004, 40, 721–727.

32. Wang, C.N.; Huang, Y.F.; Chai, Y.C.; Van Thanh, N. A multi-criteria decision making (MCDM) for renewable energy plants locations selection in Vietnam under a fuzzy environment. Appl. Sci. 2018, 8, 1–33.

33. Shannon, C.E. A mathematical theory of communication. Bell Syst. Tech. J. 1948, 27, 379–423.

34. Amorocho, J.; Espildora, B. Entropy in the assessment of uncertainty in hydrologic systems and models. Water Resour. Res. 1973, 9, 1511–1522.

35. Pujol, F.A.; María José Pujol, M.J.; Rizo-Maestre, C.; Pujol, M. Entropy-Based Face Recognition and Spoof Detection for Security Applications. Sustainability. 2020, 12, 85, 1–18.

36. [Wei](https://sciprofiles.com/profile/895789) G.; [Sun](https://sciprofiles.com/profile/488733) P; [Zhang](https://sciprofiles.com/profile/409928) Z.; [Ouyang](https://sciprofiles.com/profile/538174) X. The Coordinated Relationship between Investment Potential and Economic Development and Its Driving Mechanism: A Case Study of the African Region. Sustainability 2020, 12, 442, 1–19.

37. Hou, B.; Yanrong, W. Supplier evaluation and selection based on improved TOPSIS method in green supply chain. J. Hunan Univ. Technol. 2014, 2, 17–25.

38. Ye, B.; Yang, Z; Wan, L.; Dong Y. Multi-Objective Evaluation of Airborne Self-Separation Procedure in Flow Corridors Based on TOPSIS and Entropy. Sustainability 2020, 12, 322, 1–15.

39. Önüt, S.; Soner, S. Transshipment site selection using the AHP and TOPSIS approaches under fuzzy environment. Waste Manag. 2008, 28, 1552–1559.

40. Balioti, V.; Tzimopoulos, C.; Evangelides, C. Multi-Criteria Decision Making Using TOPSIS Method Under Fuzzy Environment. Application in Spillway Selection. Multidiscip. Digit. Publ. Inst. Proc. 2018, 2, 11.

41. Hamdan, S.; Cheaitou, A. Supplier selection and order allocation with green criteria: An MCDM and

multi-objective optimization approach. Comput. Oper. Res. 2017, 81, 282–304.

42. Choudhary, D.; Shankar, R. An STEEP-fuzzy AHP-TOPSIS framework for evaluation and selection of thermal power plant location: A case study from India. Energy 2012, 42, 510–521.

43. Junaid M. ; Xue Y.; Syed M.W.; Li J.Z.; Ziaullah M. A Neutrosophic AHP and TOPSIS Framework for Supply Chain Risk Assessment in Automotive Industry of Pakistan. Sustainability 2020, 12, 154, 1–26.

44. Abdel-Basset, M.; Gunasekaran, M.; Mohamed, M.; Chilamkurti, N. A framework for risk assessment, management and evaluation: Economic tool for quantifying risks in supply chain. Futur. Gener. Comput. Syst. 2019, 90, 489–502.

45. Akram, M.; Shumaiza; Arshad, M. Bipolar fuzzy TOPSIS and bipolar fuzzy ELECTRE-I methods to diagnosis. Comput. Appl. Math. 2020, 39, 1–23.

46. Zhang H.; Quanxin Sun Q. An Integrated MCDM Approach to Train Derailment Risk Response Strategy Selection. Symmetry 2020, 12, 47, 1–19.

47. Zhang, K.; C. Kluck; G. Achari. A comparative approach for ranking contaminated sites based on the risk assessment paradigm using fuzzy PROMETHEE. J. Environ. Manage. 2009, 44 (5), 952–967.

48. Zahir, S. Normalisation and rank reversals in the additive analytic hierarchy process: a new analysis. Int. J. Oper. Res. 2009, 4 (4), 446–467.

49. Ertugrul, I.; N. Karakasoglu Comparison of fuzzy AHP and fuzzy TOPSIS methods for facility location selection. Int. J. Adv. Manue. Tech. 2008, 39 (7–8), 783–795.

50. Ishizaka, A.; Lusti M. How to derive priorities in AHP: a comparative study. Central European Journal of Operational Research. 2006, 14 (4), 387–400.

51. Saaty, T.L. Making and validating complex decisions with the AHP/ANP. J. Syst. Sci. Syst. Eng. 2005,14 (1), 1–36.

52. Leskinen, P.; Kangas J. Rank reversals in multi-criteria decision analysis with statistical modeling of ratio-scale pairwise comparisons. J. Oper. Res. Soc. 2005, 56 (7), 855–861.

53. Zhao, H.; Yao, L.; Mei, G.; Liu, T.; Ning, Y. A Fuzzy comprehensive evaluation method based on AHP and entropy for landslide susceptibility map. Entropy 2017, 19, 396.

54. Dong, X.; Lu, H.; Xia, Y.; Xiong, Z. Decision-making Model under Risk Assessment Based on Entropy. Entropy 2016, 18, 404.

55. Liang, J.; Shi, Z.D.; Wierman, M.J. Information entropy, rough entropy and knowledge granulation in incomplete information systems. Int J. Gen. Syst. 2006, 35, 641–654.

56. Wu, D.; Wang, N.; Yang, Z.; Li, Li, ID C.; Yang, Y. Comprehensive Evaluation of Coal-Fired Power Units Using grey relational analysis and a hybrid entropy-based weighting method. Entropy 2018, 20, 215.

57. Satty, T.L. A scaling method for priorities in hierarchical structure, J. Math. Psychol. 1977, 15, 274–281.

58. Satty, T.L. Rank generation, preservation, and reversal in the analytic hierarchy decision process. Decis. Sci. 1987, 18, 157–177.

59. Chen, C.-H. Evaluative model of projects of landscape ecological planning-application of AHP method. J. Archit. Plann. 2016, 17, 117–136.

60. Satty, T.L. The Analytic Hierarchy Process; McGraw-Hill Company: New York, NY, USA, 1980.

61. Paelinck, J.H.P. Qualitative multiple criteria analysis, environmental protection and multiregional development, Pap. Reg. Sci. 1976, 36, 59–76.

62. Chu, A.T.W.; Kalaba, R.E.; Spingarn, K. A Comparison of two methods for determing the weights of belonging to Fuzzy Sets. J. Optimiz. Theory App. 1979, 27(4), 531–538.

63. Srinivasan, V.; Shocker, A.D. Linear programming techniques for multidimensional analysis of preferences. Psychometrika. 1973, 38(3), 337-369.

64. Deng, J.L. An introduction to grey system theory. J. Grey Syst. 1989, 1(1),1–24.

65. Chang, S.C. Comparison of simulation analysis of multiple attribute decision making methods. Master’s degree, Institute of Management Science, Ming Chuan University, Taipei City, 2001.

© 2020 by the author. Licensee MDPI, Basel, Switzerland. This article is an open access article distributed under the terms and conditions of the Creative Commons Attribution (CC BY) license (http://creativecommons.org/licenses/by/4.0/).