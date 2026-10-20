<!--
SOURCE: 原始 PDF: reference/推荐算法/Xu 等 - 2023 - Knowledge graph and CBR-based approach for automated analysis of bridge operational accidents Case.pdf | 页数: 21 | 集合: reference
题录: litfull-070 Knowledge graph and CBR-based approach for automated analysis of bridge operational accide (DOI: 10.1371/journal.pone.0294130)
提取: MinerU markdown 全文（可重建索引的真相源副本；images/ 不入 corpus）
-->
RESEARCH ARTICLE

# Knowledge graph and CBR-based approach for automated analysis of bridge operational accidents: Case representation and retrieval

**Hui Xu**[**ID**](https://orcid.org/0000-0002-0744-3002)**1,2\*, Yuxi Wei1, Yonggang Cai3, Bin Xing2**

![](images/page_0_image_4.jpg)

111111111 updates

![](images/page_0_image_6.jpg)

## OPEN ACCESS

**Citation:** Xu H, Wei Y, Cai Y, Xing B (2023) Knowledge graph and CBR-based approach for automated analysis of bridge operational accidents: Case representation and retrieval. PLoS ONE 18(11): e0294130. [https://doi.org/10.1371/journal.pone.0294130](https://doi.org/10.1371/journal.pone.0294130)

**Editor:** Yogan Jaya Kumar, Universiti Teknikal Malaysia Melaka Fakulti Teknologi Maklumat dan Komunikasi, MALAYSIA

**Received:** July 29, 2023

**Accepted:** October 24, 2023

**Published:** November 7, 2023

**Copyright:** © 2023 Xu et al. This is an open access article distributed under the terms of the [Creative Commons Attribution License](http://creativecommons.org/licenses/by/4.0/), which permits unrestricted use, distribution, and reproduction in any medium, provided the original author and source are credited.

**Data Availability Statement:** The data and source codes that support the findings of this study are openly available at [https://github.com/CYG-super/CBR](https://github.com/CYG-super/CBR).

**Funding:** This research was funded by The General Project of Chongqing Natural Science Foundation (Grant No. cstc2021jcyj-msxmX0951); The Western Project of the National Social Science Fund of China (Grant No. 22XGL013); The China Postdoctoral Science Foundation (Grant No.

1 School of Economics and Management, Chongqing University of Posts and Telecommunications, Chongqing, China, 2 Chongqing Innovation Center of Industrial Big-Data Co. Ltd., National Engineering Laboratory for Industrial Big-Data Application Technology, Chongqing, China, 3 College of Computer and Information Science, College of Software, Southwest University, Chongqing, China

\* xuhui@cqupt.edu.cn

## Abstract

Bridge operational accident analysis is a critical process in bridge operational risk management. It provides valuable knowledge support for responding to newly occurring accidents. However, there are three issues: (1) research specifically focused on the past bridge operational accidents is relatively scarce; (2) there is a lack of mature research findings regarding the bridge operational accidents knowledge representation; and (3) in similar case retrieval, while case-based reasoning (CBR) is a valuable approach, there are still some challenges and limitations associated with its usage. To tackle these problems, this research proposed an automated analysis approach for bridge operational accidents based on a knowledge graph and CBR. The approach includes case representation and case retrieval, leveraging advancements in computer science and artificial intelligence. In the proposed approach, the case representation involves the adoption of a knowledge graph to construct multi-dimensional networks. The knowledge graph captures the relationships between various factors and entities, allowing for a comprehensive representation of accidents domain knowledge. In the case retrieval, a multi-circle layer retrieval strategy was innovatively proposed to enhance retrieval efficiency. Three target cases were randomly selected to verify the validity of the proposed methodology. The combination of a knowledge graph and CBR can indeed provide useful tools for the automated analysis of bridge operational accidents. Additionally, the proposed methodology can serve as a reference for intelligent risk management in other types of infrastructures.

## Introduction

Bridge engineering indeed plays a crucial role in people’s lives. Over the past few years, there has been a significant increase in the construction of bridges worldwide, encompassing various types such as highway bridges, railway bridges, river crossing bridges, and sea crossing bridges, among others. Notably, China has been at the forefront of bridge construction, with a total number of modern bridges exceeding 1 million. Additionally, China boasts an impressive feat

2021M700617); The Science and Technology Research Program of Chongqing Municipal Education Commission (Grant No. KJQN202000631); The Innovative Project of Chongqing Oversea Study Innovation Program (Grant No. cx2020035). The funders had no role in study design, data collection and analysis, decision to publish, or preparation of the manuscript.

**Competing interests:** The authors have declared that no competing interests exist.

of having 90 out of the world’s top 100 high bridges that were newly built in the 21st century [1]. The operation of bridge is indeed vulnerable to various types of risks. Over the past 30 years, China has experienced more than 300 bridge operational accidents, encompassing accidents such as terrorist attack, blast threat, dangerous goods transportation, overload transportation, and bridge pier collision. Accident reports provide information to understand why and how events occur. Extracting information from these previous accidents, including accident types, causes, locations, and response measures, can provide invaluable knowledge for accident risk mitigation [2]. The hidden knowledge among past accidents, such as accident frequency, accident distribution, et al., can also be extracted [3]. By leveraging the lessons learned from past accidents, authorities and engineers can enhance bridge safety measures and reduce the likelihood of future accidents.

According to the nature of bridge operational accidents, the knowledge derived from the accidents exhibits distinct topological characteristics. To further enhance our understanding of accident information, there has been a significant focus on conducting topological analyses of bridge accident networks. Multi-dimensional networks, which encompass diverse types of nodes and edges, have the potential to offer more comprehensive information for topological analyses of bridge operational accidents. However, it is worth noting that existing studies have predominantly focused on single-dimensional complex networks. These networks typically consist of homogeneous nodes, such as cause-effect relationship edges [2]. Furthermore, the widely used topological indicators are primarily derived from single-dimensional networks, such as degree, betweenness centrality, and clustering coefficient [4]. Applying these indicators to reveal the inherent features of multi-dimensional networks with multiple types of nodes and edges becomes challenging. In this research, the use of a knowledge graph was considered to explore bridge operational accidents. The knowledge graph was proposed by Google in 2012 to improve the performance of search engines using semantic search information accumulated from various sources [5]. Knowledge graphs are powerful tools for representing entities, attributes, and relationships in a structured and interconnected manner [6]. In a knowledge graph, entities are represented as nodes, while relationships between entities are represented as edges or links. This structured representation forms the basic units of the graph, often referred to as "entity–relation–entity" triples [7]. In addition, knowledge graphs have the capability to automatically extract knowledge triples from both structured and unstructured data. By integrating, processing, and inferring information, they can form com plex semantic networks of knowledge [5]. Therefore, a knowledge graph is indeed a database that connects various entities with attributes through relationships. Therefore, this study utilizes a knowledge graph modeling method to conduct analysis on bridge operational accidents. In addition, this research also incorporates a case-based reasoning (CBR) approach to extract risk response experience from past bridge operational accidents. CBR mimics human cognition and learning by adapting previously successful similar cases to generate appropriate solutions. CBR has gained increasing attention in emergency response management [8]. By leveraging the knowledge and experiences derived from historical cases, CBR can enhance decision-making processes and improve the effectiveness of emergency response in bridge operational accidents.

The purpose of this study is to build a knowledge graph of bridge operational accidents based on historical accident data, and further integrate CBR to conduct research on similar case retrieval. By identifying similar cases, the study aims to provide insights and references for resolving new operational accidents in bridge management through case experience reuse. The research framework is as follows. Section 2 is the literature review, which presents the research gaps. Section 3 provides an introduction to case representation and case retrieval methods, specifically focusing on the use of knowledge graphs and CBR. In Section 4, an

application results of the methodology is presented, demonstrating its practical implementation in real bridge operational accidents. This application serves to validate the feasibility and efficacy of the proposed case representation and retrieval methods. Section 5 is the discussion. Finally, in Section 6, the paper concludes with a summary of the findings and presents the theoretical and practical contributions of this study.

## Literature review

As bridge is a crucial component of infrastructure engineering, many methods adopted in infrastructure operational risk research are also applicable to exploring operational risks in bridges. Analyzing past accident data is indeed a widely used method to understand operational risks in infrastructure. Elvik et al. adopted negative binomial regression models to iden tify factors that explain systematic variation in the number of injury based on 1368 bridge accidents in Norway from 2010 to 2016 [9]. Liu et al. proposed a network theory-based approach to understanding railway operational accidents. The topological analysis for the accidents provides a practical way to extract the accidents knowledge from accident reports [10]. Zhou and Lei explored the paths between latent and active errors for 407 railway accidents/ incidents by using the Human Factors Analysis and Classification System [11]. Hughes et al. described a multi-lingual ontology to identify specific classes of railway safety incident based on 5065 safety incident reports [12]. Drawing on existing research findings, this study conducts the automated analysis of bridge operational accidents based on the collected bridge operational accidents. A knowledge graph has been adopted to establish the structure of accident cases and support CBR in extracting risk response experiences.

## Knowledge graph application and construction

The application of knowledge graphs in risk management research has proven to be valuable. Specifically, in the domain of gas system risk management, a temporal knowledge graph have been constructed and utilized for predicting the risk level of the system [13]. In the field of long-distance oil and gas pipeline emergency management, the establishment of a knowledge graph has been employed to develop an emergency task recommendation model [14]. For rail way hazard management, a knowledge graph has been developed for hazard identification and risk assessment in railway operations [15]. In the field of construction risk management, a knowledge graph of accidents has been used for accident analysis and prevention [6]. Besides, a knowledge graph-based decision support approach was proposed for the operational hazard management of utility tunnels based on structured field investigation data and unstructured text files [5].

The construction of a knowledge graph typically involves the combination of multiple tech nologies and methods. Ontologies provide a generalized data model that captures shared properties and relationships among general types of things, and don’t include information about specific individuals within a particular domain. By utilizing ontologies as a framework, specific case information can be added to create a knowledge graph [16]. For example, Guo and Goh developed an ontology to facilitate knowledge sharing and reuse in the design of active fall pro tection systems (AFPS) [17]. Fang et al. integrated computer vision algorithms with ontology models to develop a knowledge graph in the field of hazard identification and safety regulations [18]. Combining with the BERT-BiLSTM-CRF algorithm, Wu et al. constructed an ontology model for knowledge representation of construction safety accidents [19]. Gan et al. established a knowledge graph for ship collision accidents by utilizing natural language processing (NLP) techniques based on 241 investigation accident reports [20]. Employing BiLSTM and Conditional Random Field (CRF) model, Chen et al. proposed a knowledge

graph for critical infrastructure protection that aimed to address information gaps in management across different industries and timeframes [21]. Besides, deep learning techniques have also been integrated into the knowledge graph construction process. For instance, a graphbased deep learning framework was proposed to identify accident-injury type and body part factors [22]. In addition, a deep learning-based method was conducted to extract and represent relations in the form of knowledge graph-based queries that describe fall protection requirements, which helps decompose complex requirements into manageable units [23].

## CBR approach in risk management

Case-based reasoning (CBR) is an alternative, increasingly popular approach for designing expert systems [24]. The 4R model, consisting of case retrieval, reuse, revision, and retention, has been established [25]. CBR has been widely adopted in similar accident case retrieval studies and making risk response decisions. In the aspect of similar case retrieval, one example is the work by Lu et al. integrated various steps of construction safety risk management into a unified framework utilizing CBR, the k-Nearest Neighbor (KNN) algorithm and rough set theory [26]. Similarly, aiming to enhance the efficiency of retrieving similar cases, Goh and Guo developed an online knowledge-based system, FPSWizard, which adopts a combination of CBR and rulebased reasoning (RBR) [27]. In the aspect of making risk response decisions, Fan et al. proposed a pragmatic method for generating project risk response strategies based on CBR [28]. Chen et al. developed a framework for a decision-support system that utilizes CBR with a nearestneighbor retrieval (NNR) search mechanism for adjudicating construction industry occupa tional accidents [29]. Liu et al. proposed a practical method for generating dispute settlement solutions for international construction projects using CBR [30]. Ayhan and Tokdemir proposed an innovative safety assessment methodology that utilizes Artificial Neural Network (ANN) and CBR to predict possible scenarios and determine preventative actions for safety incidents, and to estimate the outcomes of incidents specifically in terms of severity [31].

## Gaps in research

According to existing studies, the following three research gaps can be concluded:

1. The experience-oriented approach in infrastructure risk management emphasizes the importance of leveraging valuable experiences from similar historical cases to address new problems. This approach has been successfully applied in various risk management domains, such as road bridge risk management and railway operational accidents management. However, research specifically focused on applying this approach to bridge operational accident management is relatively scarce.

2. There is a lack of mature research findings regarding the bridge operational accidents knowledge representation. Indeed, knowledge graphs have found applications in risk management research across multiple domains, including gas system risk management, long distance oil and gas pipeline emergency management, railway hazard management, construction risk management, utility tunnels’ hazard management, etc. These applications have demonstrated the effectiveness of knowledge graphs in representing accident cases. However, the application of knowledge graphs in bridge operational management, particularly for understanding bridge operational accidents, has been relatively limited.

3. The CBR approach is valuable in enriching reference cases for experience mining. However, there are still some challenges and limitations associated with its usage. Besides, it is common to combine CBR with other methods to leverage their respective strengths and enhance the overall performance. Some approaches that can be combined with CBR

include: KNN, rough set theory, RBR, NNR, ANN, etc. Nevertheless, there has been limited research on the combined use of CBR and knowledge graphs, and it is an area worth exploring further.

This study aims to address these three gaps. It focuses on conducting an automated analysis of bridge operational accidents. A knowledge graph representing bridge operational risk knowledge is constructed. Besides, the CBR approach has been innovatively utilized and integrated with knowledge graphs.

## Methods

## Knowledge representation based on knowledge graph

To study bridge operational accidents, a specific knowledge graph called the Bridge Operational Accident Knowledge Graph (BOAKG) is constructed. The first step involves extracting knowledge entities from the accident cases, which represent concepts or entities in the real world. The second step is to identify the relationships among these knowledge entities. These relationships capture the semantic connections between the entities and reflect the dependen cies and interactions within the accident scenarios. Finally, the knowledge entities and their relationships are mapped into a network graph, forming the BOAKG.

**Extraction of knowledge entities and attributes.** The knowledge entities in the BOAKG represent fundamental units of knowledge related to bridges. It is important to note that the extent of accident data coverage determines the range of corresponding knowledge entities [2]. To extract these entities, the complete contents of the accident cases are preserved and be the base of the text segmentation. In English text, spaces between words serve as natural delim iters, making it relatively easy to identify word boundaries. However, in Chinese text, the delimiters do not indicate word boundaries as clearly. Instead, they mark the boundaries between characters, sentences, and paragraphs, which poses a challenge when it comes to determining the boundaries between individual words. There are various Chinese text segmentation tools available, including THULAC, NLPIR, LTP, Jieba, HanLP, etc. LTP and HanLP are more focused on semantic analysis and provide additional functionalities beyond just text segmentation. These tools use advanced models and techniques to perform tasks such as named entity recognition and part-of-speech tagging. Jieba, THULAC, and NLPIR are primarily designed to accurately segment Chinese text into individual words or tokens. Jieba has several advantages that make it a popular Chinese text segmentation tool. One is its ability to accurately segment Chinese sentences and long phrases, while also precisely punctuating them [32]. It also offers several other functionalities, including keyword extraction and word position query [5]. Besides, Python is a popular programming language in Jieba application for natural language processing and data analysis due to its portability, readability, and ease of use [6]. Thus, the Jieba Chinese text segmentation algorithm is employed in this study. This algorithm follows three steps. Firstly, word graph scanning based on a prefix dictionary. The algo rithm scans the text to identify possible words using a dictionary that contains word prefixes. Secondly, finding all the possibilities of Chinese characters in sentences. Thirdly, finding the most probable combination based on word frequency. By applying the algorithm, the accident case text can be effectively segmented into meaningful units, which serve as the knowledge entities for further analysis and representation in the BOAKG.

Then, keyword extraction. The commonly used methods for feature extraction included word frequency, mutual information, chi-square value, etc. Subsequently, the term frequency and inverse document frequency (TF-IDF) algorithm emerged and presented advantages. The TF-IDF algorithm, initially proposed by Karen Sparck Jones, is widely used in searching and applied to text similarity calculation [33]. The fundamental idea behind TF-IDF is that if a word appears frequently in a document but less frequently in other documents, it carries more significance in distinguishing the document and expressing its core content. Hen2vecce, such words are assigned higher weights [34]. The TF-IDF algorithm calculates a weight for each word in a document based on the term frequency (TF) and inverse document frequency (IDF). Due to its simplicity and effectiveness, the TF-IDF algorithm has become a well-developed and commonly used method in the fields of information retrieval, text mining, and word importance representing. Therefore, the TF-IDF method is utilized for keyword extraction from bridge accident cases. The extracted keywords are considered representative of the acci dents. It is calculated using the equation:

$$
t f _ { i j } = \frac { n _ { i , j } } { \sum { } _ { k } n _ { k , j } }\tag{1}
$$

where $t f _ { i j }$ indicates the word frequency of word i in document j, $n _ { i j }$ is the number of the word in document $j ,$ and $\Sigma _ { k } n _ { k , j }$ represents the sum of all words in document j. idf is the frequency of reverse documents and the Equation is

$$
i d f = \mathit { l o g } \frac { | \mathrm { D } | } { | \{ j : t \in d _ { j } \} | + 1 }\tag{2}
$$

where |D| is the total number of all documents in the corpus, $| \{ j { : } t { \in } d _ { j } \} |$ represents the number of documents containing the word $t _ { i }$ and the denominator+1 is to ensure the normal operation when $n _ { i , j }   = 0$ . The entities could be classified based on the keywords extraction.

The keywords with high frequency are extracted and sorted as nodes. In total, 12 types of knowledge entities are identified and extracted, including accident title, bridge structure, bridge materials, accident position, accident season, accident time period, accident area, accident location (city), level of accident area, accident classification, cause of accident, and accident severity.

The specific description of the accident is used as an attribute, where each attribute value is unique for every case [35]. Attributes of an accident can be extracted to describe the case in multiple dimensions. In this research, six event descriptions are taken as the attributes of the accident, including accident time, specific location of the accident, response measures, accident evolution chain, number of casualties, and economic loss.

**Extraction of links among knowledge entities.** The identification of links is a crucial step in determining the relationships among knowledge entities and constructing the BOAKG. These relationships encompass cause-effect relationships as well as association relationships. Association relationships is the connections between accidents and their consequences, accident reasons, and other related entities. In this research, association relationships are explored specifically between the entity "accident title" and other entities, as outlined in Table 1.

**Construction of the BOAKG.** In the construction of a knowledge graph, knowledge entities and their links are represented by knowledge triples. The construction of the BOAKG involves two types of knowledge triples: &lt;entity, link, entity&gt; and &lt;entity, attribute, attribute value&gt;. All bridge accident cases are stored in the form of triples in a Neo4j database, which is achieved through an automatic Python script. This allows for the construction and presentation of the BOAKG within the Neo4j database environment.

## Accident characteristic attribute weights calculation

Weight calculation methods can be broadly categorized into subjective methods and objective methods. One popular objective method for data weighting is the entropy weight method.

Table 1. Links among knowledge entities.

| Entity | Link | Entity |
| --- | --- | --- |
| accident title | &lt;bridge structure> | bridge structure information |
| accident title | &lt;bridge materials> | bridge materials information |
| accident title | &lt;accident position> | accident position information |
| accident title | &lt;accident season> | accident season information |
| accident title | &lt;accident time period> | accident time period information |
| accident title | &lt;accident area> | accident area information |
| accident title | &lt;accident location (city) > | accident location (city) information |
| accident title | &lt;level ofaccident area> | level ofaccident area information |
| accident title | &lt;accident classification> | accident classification information |
| accident title | &lt;cause ofaccident> | cause ofaccident information |
| accident title | &lt;accident severity> | accident severity information |

[https://doi.org/10.1371/journal.pone.0294130.t001](https://doi.org/10.1371/journal.pone.0294130.t001)

This method utilizes entropy, which measures the variability or diversity of an index, to assign weights objectively. However, it may lead to evaluation results that differ from expectations due to a limited number of indicators or inaccurate calculation of indicator data. The Analytic Hierarchy Process (AHP) method is a widely recognized and representative method for subjective analysis weighting. It was introduced and defined by Thomas Saaty in 1977 and has since been utilized as an effective tool for handling complex decision-making problems [36]. The method primarily relies on the subjective analysis and judgment of decision-makers rather than considering actual data of the criteria. It accommodates subjective weighting of factors from the perspectives of different decision-makers [37], and involves directly assigning subjective scores or judgments to determine the weights of criteria or alternatives. Compared to other methods, the calculation process is relatively simple. Besides, AHP is indeed one of the most comprehensive multi-criteria decision-making methods and has found widespread applications in various scientific fields. Furthermore, this approach helps minimize judgmental inconsistencies and requires less information to describe complex decision-making processes [38]. Bridge accidents often involve multiple factors. By applying the AHP method, quantitative assessment and decision-making can be conducted on the accident characteristic attributes. The essential steps of the AHP are as follows:

a. Determine the decision goal, criteria, and alternatives in the AHP structure of the decision problem, which serve as the target layer, criterion layer, and alternative layer, respectively.

b. Compare the importance of all factors in each criterion layer and create the pairwise comparison matrix.

c. Sort each vector at the upper level according to their importance.

d. Obtain the total priority value ranking of the scheme level relative to the target level by combining the upper and lower vectors.

e. Perform a consistency test on the judgment matrix to ensure logical consistency in the thought process.

**Construction of the pairwise comparison matrix.** Firstly, analyze the relationships among the elements to establish a three-level structure consisting of the target layer, criterion layer, and alternative layer. Then, compare the importance of all elements within each layer and create the pairwise comparison matrix. These comparisons are made by experts who assess the importance of a criterion in relation to other criteria using the AHP value scale. This process is conducted for all elements within each layer, aiming to determine the level of importance and prioritize each sub-factor. Each relevant sub-factor is assigned a relative weight to ascertain its significance. The scaling definition of the matrix can be found in Table 2.

Table 2. The scaling definition.

| Scale | Meaning |
| --- | --- |
| 1 | Comparing the two factors, the two factors are equally important. |
| 3 | Comparing the two factors, one factor is slightly more important than the other. |
| 5 | Comparing the two factors, one factor is significantly more important than the other. |
| 7 | Comparing the two factors, one factor is strongly more important than the other. |
| 9 | Comparing the two factors, one factor is extremely more important than the other. |
| 2,4,6,8 | The median ofthe two neighboring judgments above. |

[https://doi.org/10.1371/journal.pone.0294130.t002](https://doi.org/10.1371/journal.pone.0294130.t002)

**Weight calculation.** Normalize the elements of the judgment matrix by column according to Eq 3.

$$
b_{ij} = \frac{a_{ij}}{\sum_{k = 1}^{n}a_{kj}}i,j = 1,2,\cdots,n\tag{3}
$$

where $a _ { i j }$ is the element of the pairwise comparison matrix.

Since the distribution of the weights was approximately reflected by each column in the pairwise comparison matrix, the arithmetic mean of all the column vectors can be used to estimate the weight vector according to Eq 4.

$$
w_{i}=\frac{b_{ij}}{n}i,j=1,2,\cdots,n\tag{4}
$$

Sum the normalized rows and then divided by n to obtain the weight value w<sub>i</sub>.

**Consistency test.** The purpose of the consistency test is to verify whether the subjective judgments consistent with the quantitative research findings. This test aims to ensure the reasonableness and validity of the research results. When $\mathrm{AW} = \lambda \mathrm{W}$ , the maximum characteristic root $\lambda _ { \mathrm { m a x } }$ can be calculated according to the following Eq 5,

$$
\lambda_{\max }=\sum_{i=1}^{n} \frac{(AW)i}{nWi}\tag{5}
$$

The consistency index is calculated through the Eq $^ { 6 , }$

$$
CI = \frac{\lambda_{ max } - n}{n - 1}\tag{6}
$$

## Accident attribute similarity calculation

**Single attribute similarity calculation.** Currently, there are several commonly used classification algorithms, including the Support Vector Machine (SVM) algorithm, Naive Bayesian algorithm, and k-Nearest Neighbor (KNN) algorithm. In the field of Chinese text classification, the SVM algorithm lacks guidance on selecting kernel functions, which makes it challenging to determine the best kernel function for specific classification problems. In the Naive Bayesian algorithm, it tends to yield good results only when there is an extensive number of training samples available. KNN can adapt well to changes in classification standards and offers lower training time complexity compared to the SVM algorithm. Furthermore, it does not make assumptions about the data and is less sensitive to outliers compared to the Naive

Bayesian algorithm. Accordingly, this research adopts the KNN algorithm in attribute similar ity calculation. KNN is a non-parametric method that was initially developed by Evelyn Fix and Joseph Hodges in 1951, and later improved by Thomas Cover [39]. It has become one of the most popular machine learning algorithms due to its simplicity and accuracy, making it suitable for handling classification and regression problems [40]. KNN operates based on the principle of finding the most similar items or users in a dataset to make predictions. The output value for a test case is determined based on the majority vote or averaging of the output values of its k-nearest neighbors in the training data [41]. By considering multiple neighbors, KNN takes into account the local structure of the data and can provide robust predictions. It can store all the available problems or cases and classify them to the new clusters based on their similarity measure. The outputs are the top k cases with the highest similarity by calculating the similarity between the target case and the source case [42]. The calculation of the single attribute similarity $S i m ( s , t )$ between the target case and the source case is based on the following Equations,

$$
\mathit { S i m } ( s , t ) = 1 - D ( s , t )\tag{7}
$$

$$
D ( s , t ) = \sqrt { \sum _ { k = 1 } ^ { n } \left( w _ { k } \times D _ { k } ( s , t ) \right) ^ { 2 } }\tag{8}
$$

where $D ( s , t )$ is the normalized Euclidean distance between the target case and the source case, k is the retrieval attribute number, n is the total number of retrieval attributes, $w _ { k }$ is the weight of the attribute k, $D _ { k } ( s ,   t )$ is the distance on k attribute dimension between the target case and the source case after normalization.

The data types of the retrieved attributes include symbolic type and numerical type, and the 2 data types of $D _ { k } ( s ,   t )$ are determined as follows:

Symbolic type:

$$
D_{k}(s,t)=\left\{\begin{aligned} & 0,\mathrm{P}_{sk}=\mathrm{P}_{tk} \\ & 1,\mathrm{P}_{sk} \neq P_{tk} \end{aligned}\right.\tag{9}
$$

Numerical type:

$$
D _ { \it k } ( s , t ) = 1 - \frac { d _ { \it k } ( s , t ) } { \it M a x _ { \it k } - \it M i n _ { \it k } }\tag{10}
$$

$$
D _ { k } ( s , t ) = | \mathsf { P } _ { s k } - \mathsf { P } _ { t k } |\tag{11}
$$

Where $\mathbf { P } _ { s k }$ is the k attribute value of the source case and $\mathbf { P } _ { t k }$ is the k attribute value of the target case, $d _ { k } ( s ,   t )$ is the distance on k attribute dimension between the source case and the target case, $M a x _ { k }$ is the maximum value of the k attribute value and $M i n _ { k }$ is the minimum value of the k attribute value in the case base.

**Comprehensive layer similarity calculation.** The comprehensive layer similarity could be calculated based on the Eq 12,

$$
\mathit{Sim}(C)=\sum_{i = 1}^{n}W_{i}\mathit{Sim}(s,t)\tag{12}
$$

Where $W _ { i }$ is the attribute weight, Sim(s,t) is the single attribute similarity.

**Global similarity calculation.** The global attribute similarity could be obtained based on the Eq 13,

$$
\mathit { S I M } ( G ) = \mathit { S i m } ( C ) c + \mathit { S i m } ( C ) \mathbf { g }\tag{13}
$$

where Sim(C)c and Sim(C)g is the comprehensive layer similarity of core circle layer and general circle layer.

## The multi-circle layer retrieval strategy

CBR is an intelligent methodology that addresses novel problems by retrieving similar historical cases and adapting their solutions, outcomes, and recommendations [43]. Among the various processes involved in a CBR system, case retrieval holds significant importance [44]. The accuracy of case retrieval greatly impacts the assessment of CBR performance [45]. The BOAKG acts as a database for storing accident information and serves as the case base for case retrieval. Similarity measure methods with multiple formats of attribute values can be found in the practical CBR applications, but the in-depth study is still lacking [46]. In recent years, several extended CBR approaches have been proposed for critical infrastructure risk response [47]. The traditional case retrieval process covers the entire case base and all the characteristic attributes of the cases, in which each attribute presents the same weight during calculation and results in a time-consuming retrieval process. However, it is crucial to recognize that not all case attributes involved in the retrieval hold equal importance. Therefore, this research proposes an innovative multi-circle layer retrieval strategy for bridge operational accident cases. The attributes involved in the retrieval are classified into multiple circle layers based on their importance and level of identification, and different weights are assigned to attributes within each layer.

**The multi-circle layer characteristic attributes.** The 11 accident characteristic attributes used for retrieval are divided into 2 circle layers: the core circle layer attributes and general circle layer attributes. The core circle layer attributes consist of cause of accident, accident classifi cation, and accident severity, which are the attributes with high commonness, high frequency, high differentiation, and high influence. The general circle layer attributes provide additional accident retrieval information and are of secondary importance compared to the core circle layer attributes. The general circle layer attributes include bridge structure, bridge materials, accident position, accident season, accident time period, accident area, accident location (city), and level of accident area. Among these attributes, the attribute “accident severity” in the core circle layer and the attribute “accident time period” in the general circle layer are numerical data, and the other attributes are symbolic data.

In this research, the characteristic attributes are stored and represented using the frame work representation method. There are many representing knowledge methods, including frame representation and object-oriented representation, etc. Object-oriented representation is similar to framework representation, but it is more refined in terms of modularity, making it more suitable for the development and implementation of computer languages. However, when it comes to representing and storing characteristic attributes, object-oriented representation may struggle to handle them effectively. Frame representation is one of the most frequently knowledge representation methods mentioned in the literature [48]. The framework representation method focuses on capturing the internal structure of objects. It is rooted in the framework theory and was initially introduced by Minsky, in 1975 [49]. The core idea is to use frames as the fundamental units of expression. Each frame consists of multiple "slots," and each slot can contain a slot value or multiple sides. A side comprises a side name and its corresponding value. The framework representation allows for the analysis of unstructured knowl edge and its representation using structured frames. Additionally, lower-level frames can inherit slot values from higher-level frames while also having the ability to supplement and modify them. These advantages make it suitable for handling bridge operational accident cases by covering the informational attributes associated with accident characteristics. Therefore,

Table 3. Characteristic attribute framework.

<table><tr><td>Slot</td><td>Side</td><td>Side Value</td><td>Type of theside</td></tr><tr><td rowspan=3>Core circlelayer</td><td>cause of accident</td><td>overload, collision, fatigue, design defects, water conservancy, quality, others</td><td>symbolic data</td></tr><tr><td>accidentclassification</td><td>overload accident, car collision accident, ship collision accident, ice edge collision accident, flood accident,landslide accident, debris flow accident, scouring accident, earthquake accident, landslide accident, designproblem accident, water conservancy accident</td><td>symbolic data</td></tr><tr><td>accident severity</td><td>basically intact(0), slight damage(1), moderate damage(2), serious damage(3), collapse(4)</td><td>numericaldata</td></tr><tr><td rowspan=8>General circlelayer</td><td>bridge structure</td><td>floating bridge, steel frame bridge, arch bridge, beam bridge, suspension bridge, composite system bridge</td><td>symbolic data</td></tr><tr><td>bridge materials</td><td>wooden bridge, cable bridge, masonry bridge, steel bridge, reinforced concrete bridge, prestressed concretebridge, hybrid bridge, composite bridge</td><td>symbolic data</td></tr><tr><td>accident position</td><td>bridge deck, arch, pier, bridge top, bottom, suspender, iron cable</td><td>symbolic data</td></tr><tr><td>accident season</td><td>spring, summer, autumn, winter</td><td>symbolic data</td></tr><tr><td>accident timeperiod</td><td>[00:00,5:00)(0); [5:00–6:00)(1); [6:00–8:00)(2); [8:00–11:00)(3); [11:00–-13:00)(4); [13:00–17:00)(5); [17:00–18:00)(6); [18:00–24:00)(7)</td><td>numericaldata</td></tr><tr><td>accident area</td><td>northeast region, north China region, east China region, south China region, central China region, northwestregion, southwest region</td><td>symbolic data</td></tr><tr><td>accident location(city)</td><td>city of the accident</td><td>symbolic data</td></tr><tr><td>level of accidentarea</td><td>municipalities directly under the central government, provincial capital cities, prefecture level cities, county-level cities, townships</td><td>symbolic data</td></tr></table>

[https://doi.org/10.1371/journal.pone.0294130.t003](https://doi.org/10.1371/journal.pone.0294130.t003)

framework representation method is used in this paper. The two-circle layer characteristic attribute framework is shown in Table 3.

**The multi-circle retrieval process.** In the process of bridge accident case retrieval, the BOAKG is employed as the initial case database to compute the similarity of the core circle layer attributes. Subsequently, select a certain number of cases according to the similarity ranking for the general circle layer selection. Based on the selected cases, the similarity of the general circle layer attributes is calculated. The final global similarity between the target case and the source case is obtained by integrating the two circle layer similarities, and the cases with high global similarity is output as the decision-making cases. The detailed process is described as follows:

## a. First round retrieval

Step 1: Input the core circle layer attributes for the first round retrieval, including cause of accident, accident classification, and accident severity.

Step 2: Calculate the weighted comprehensive similarity Sim(k,t) of the core circle layer attributes between the target case and the k-th case in the case base.

Step 3: Sort the obtained Sim(k,t) values in descending order and take the first n cases as the core circle type matching results.

## b. Second round retrieval

Step 1: Input the general circle layer attributes for the second round retrieval, including bridge structure, bridge materials, accident position, accident season, accident time period, accident area, accident location (city), and level of accident area.

Step 2: Calculate the weighted comprehensive similarity Sim(m,t) of the general circle layer attributes between the target case and the m-th case among the selected n cases. Combining with the core circle layer weighted comprehensive similarity obtained from the first round, the final global similarity result Sim(n,t) could be obtained.

Step 3: Sort the Sim(n,t) values in descending order and obtain the final case retrieval results.

Compared to traditional case retrieval methods, the approach used in this research significantly reduces the number of cases. By retrieving cases based on the core circle layer attributes, the initial set of similar cases is narrowed down. Then, the subsequent retrieval process becomes less complex and the overall retrieval time is reduced.

## Results

## Data collection

**Topic-specific web crawler.** The research utilized topic-specific web crawler technology to gather relevant web pages related to the interested topics from the internet [50]. This technology enables selective and efficient extraction of specific information. In this research, the topic-specific web crawler technology was employed to obtain the name, time, source, place, and complete contents of the Chinese bridge accident case. The basic flow chart is shown as (Fig 1).

The information in the level-1 web page is the title of the case report, and the information in the level-2 web page is the detailed content of the case report. The name, time, source, place and complete contents of the bridge accident case could be obtained through the crawler process. The name of a case is the title of the news. The time of the case refers to the actual occurrence time. However, in some cases, the report time is not the accurately happening time or the happening time is not clear, which requires manual revision in the later stage. The source of the case is the name of the website, journal, etc. The place of the case is the administrative divisions at the provincial and municipal level in China. The complete contents of the case generally encompass the information about causes, process, results and corresponding mea sures of the accident. In total, 5462 pieces of original text were collected.

**Manual screening.** Due to the repetition of news reports and irrelevant information crawling, the collected original data need manually screening. Firstly, filtering the accident cases after 1978. Secondly, focusing on the news of the same day or another day according to the time of news release, and integrating the repeated cases. Thirdly, deleting cases with low fitness and relevance. Finally, a total of 324 effective Chinese bridge operational accident cases data were obtained.

## BOAKG modelling

The field of bridge operational accidents is relatively specialized and has clear boundaries, with limited available knowledge. To address this, a down-top approach was employed to establish a BOAKG.

**Extraction of knowledge entities, attributes, and links.** Through the analysis of data with similar faults and causes, the structural data of bridge operational accident can be

![](images/page_11_image_11.jpg)

Fig 1. Topic-specific web crawler flow chart.

[https://doi.org/10.1371/journal.pone.0294130.g001](https://doi.org/10.1371/journal.pone.0294130.g001)

Table 4. Number of knowledge entities and links.

<table><tbody><tr><td>Category</td><td>Knowledge entities/ links</td><td>Meaning</td><td>Number</td><td>Sum</td></tr><tr><td rowspan="12">Entities</td><td>cAccident</td><td>accident title</td><td>324</td><td rowspan="12">709</td></tr><tr><td>cStructure</td><td>bridge structure</td><td>6</td></tr><tr><td>cMaterial</td><td>bridge materials</td><td>8</td></tr><tr><td>cPosition</td><td>accident position</td><td>12</td></tr><tr><td>cSeason</td><td>accident season</td><td>4</td></tr><tr><td>cPeriod</td><td>accident time period</td><td>8</td></tr><tr><td>cArea</td><td>accident area</td><td>7</td></tr><tr><td>cLocation</td><td>accident location (city)</td><td>285</td></tr><tr><td>cLevel</td><td>level ofaccident area</td><td>5</td></tr><tr><td>cTypes</td><td>accident classification</td><td>11</td></tr><tr><td>cReason</td><td>cause ofaccident</td><td>34</td></tr><tr><td>cDegree</td><td>accident severity</td><td>5</td></tr><tr><td rowspan="12">Links</td><td>rAccident_Structure</td><td>bridge structure in the accident</td><td>324</td><td rowspan="12">3888</td></tr><tr><td>rAccident_Material</td><td>bridge materials in the accident</td><td>324</td></tr><tr><td>rAccident_Part</td><td>accident position</td><td>324</td></tr><tr><td>rAccident_Season</td><td>accident season</td><td>324</td></tr><tr><td>rAccident_Period</td><td>accident time period</td><td>324</td></tr><tr><td>rAccident_Area</td><td>accident area</td><td>324</td></tr><tr><td>rAccident_Location</td><td>accident location (city)</td><td>324</td></tr><tr><td>rAccident_Level</td><td>level ofaccident area</td><td>324</td></tr><tr><td>rAccident_Types</td><td>accident classification</td><td>324</td></tr><tr><td>rAccident_Reason</td><td>cause ofaccident</td><td>324</td></tr><tr><td>rAccident_Degree</td><td>accident severity</td><td>324</td></tr><tr><td>rAccident_Time</td><td>Accident occurrence time</td><td>324</td></tr></tbody></table>

[https://doi.org/10.1371/journal.pone.0294130.t004](https://doi.org/10.1371/journal.pone.0294130.t004)

obtained and the effect of knowledge fusion can be achieved. The Jieba Chinese text segmentation algorithm and the TF-IDF method were utilized for the extraction of knowledge entities. A total of 12 types of knowledge entities were extracted from the collected the collected 324 bridge accident cases, including accident title, bridge structure, bridge materials, accident position, accident season, accident time period, accident area, accident location (city), level of accident area, accident classification, cause of accident, and accident severity. Additionally, 6 attributes of the accident were also extracted, including accident time, specific location of the accident, response measures, accident evolution chain, number of casualties, and economic loss. The association relationships are considered between the entity “accident title” and other entities. In total, 709 entities and 3888 links were extracted, as shown in <u>Table 4</u>. The data is stored in CSV format and imported in Neo4j for further analysis.

**BOAKG modelling construction.** Based on the knowledge extraction process, the bridge accidents can be represented in the form of two types of knowledge triples: &lt;entity, link, entity&gt; and &lt;entity, attribute, attribute value&gt;. All the bridge accident cases are stored in the Neo4j database in the form of triples through automatic build of Python script. The constructed BOAKG modelling is shown as (Fig 2).

## Case retrieval validation

**Structure the decision hierarchy of bridge operational accident.** Structure the decision hierarchy of bridge operational accident with a top-down approach based on the multi-circle layer retrieval strategy. The hierarch consists of the target layer at the top, the intermediate criterion layer, and the lowest alternative layer, as shown in (Fig 3).

![](images/page_13_image_2.jpg)

Fig 2. The BOAKG.

[https://doi.org/10.1371/journal.pone.0294130.g002](https://doi.org/10.1371/journal.pone.0294130.g002)

**Pairwise comparison matrix construction and weight calculation.** Five experts were invited to discuss the pairwise comparison of the elements in each layer. All the members of expert panel have earned their doctorate degrees in engineering management. They also have more than ten years of working experiences in bridge operation management or research. AHP approach was applied after the hierarchy developed. Three pairwise comparison matrices were obtained through pair-wise comparison in the three layers based on the five experts’ com prehensive judgement opinions. Specifically, each expert provided independent scores, resulting in three pairwise comparison matrices, respectively. Further, the average score from the five experts were computed and three integrated pairwise comparison matrices were constructed. Finally, the weights were calculated according to the Eq 3 and Eq 4, as shown in Table 5.

**Consistency test.** Based on the pairwise comparison matrices, $\lambda _ { m a x }$ can be respectively calculated according to Eq 5, which are 2.0000, 3.0536, and 8.4807. The consistency test is conducted according to Eq 6 and the results are presented in Table 6. According to the results, the values calculated by the three pairwise comparison matrices are consistent with CI<0.1, which satisfy the consistency test standard.

**Similarity calculation.** Three target cases were selected for the case retrieval algorithm validation. Two parameters, n and k, were set for each test case. Here, n represents the top n cases selected for the first round retrieval, and k represents the top k cases selected for the second round retrieval. The number of nodes that successfully matched all cases in the case base was counted and the feasibility of the retrieval model was validated. The selected three target

![](images/page_14_image_2.jpg)

Fig 3. The decision hierarchy of bridge operational accident.

[https://doi.org/10.1371/journal.pone.0294130.g003](https://doi.org/10.1371/journal.pone.0294130.g003)

Table 5. The weights calculation results.

| Criteria | Criterion layers and Alternatives | W<sub>i</sub> |
| --- | --- | --- |
| The two layers | The core circle layer | 0.9000 |
|  | The general circle layer | 0.1000 |
| The core circle layer | Cause ofaccident | 0.4440 |
|  | Accident classification | 0.1762 |
|  | Accident severity | 0.2797 |
| The general circle layer | Bridge structure | 0.0103 |
|  | Bridge materials | 0.0099 |
|  | Accident position | 0.0151 |
|  | Accident season | 0.0178 |
|  | Accident time period | 0.0218 |
|  | Accident area | 0.0113 |
|  | Accident location (city) | 0.0059 |
|  | Level ofaccident area | 0.0080 |

[https://doi.org/10.1371/journal.pone.0294130.t005](https://doi.org/10.1371/journal.pone.0294130.t005)

Table 6. The consistency ratio of the judgment matrix.

| The judgment matrix | The circle layer | The core circle layer | The general circle layer |
| --- | --- | --- | --- |
| CI | 0.0000 | 0.0516 | 0.0487 |

[https://doi.org/10.1371/journal.pone.0294130.t006](https://doi.org/10.1371/journal.pone.0294130.t006)

cases are “7.7 Collapse Accident of Qili Bridge in Liu’an City, Anhui Province”, “5.12 Collapse Accident of Shoujiang Bridge in Wenchuan County, Sichuan Province”, and “6.23 Ship Collision Accident of Jinshan Hengxi East Street Bridge in Shanghai”, which are abbreviated as “7.7”, “5.12”, and “6.23”, respectively. The attribute information of the three target cases is shown in Table 7.

In the case base, there are a total of 324 cases numbered from 1 to 324. The similarity calculation includes evaluating attribute similarity of the attributes similarity in the core circle layer, the general circle layer, and the global similarity. For the 3 cases, the values of the parameters n and k are set as 15 and 5, respectively. Taking the first case “7.7” as an example to show the retrieval results, as presented in Table 8.

The retrieval results for the 3 target cases are shown in Table 9.

According to the retrieval results, the top 5 cases exhibit a high similarity in the core circle layer, with all values above 0.8000. However, only several cases show high similarity in general circle layer. The retrieval results indicate the significance of the core circle layer attributes. It is worth noting that the global similarity of the top 5 cases is also above 0.8000, affirming the feasibility of the case retrieval algorithm.

## Discussion

Based on Table 9, it is observed that each target case has a similarity score of 100% when matched with itself. Furthermore, the table suggests that the target cases can also be matched with other cases that share the same type of accident or cause. These matching cases exhibit a relatively high degree of similarity to the target case. For example, "7.7 Collapse Accident of Qili Bridge in Liu’an City, Anhui Province" has similar cases such as "No.228-8.14 Collapse Accident of Shipuhead Bridge in Lishui, Zhejiang Province" " No.193-7.1 Collapse Accident of Jiulongwan 2# in Xinhua Line, Lvliang, Shanxi Province," and "No.244-7.11 Collapse Accident of Chuanxi Bridge in Chengdu, Sichuan Province", all of which are hydraulic engineering accidents. Similarly, accidents "5.12 Collapse Accident of Shoujiang Bridge in Wenchuan County,

Table 7. The attribute information of the three cases.

<table><tbody><tr><td>Accident/Attribute</td><td>7.7</td><td>5.12</td><td>6.23</td><td>Circle layer</td></tr><tr><td>Cause ofaccident</td><td>water erosion</td><td>earthquake</td><td>ship collision</td><td rowspan="3">core circle layer</td></tr><tr><td>Accident classification</td><td>water conservancy accident</td><td>earthquake accident</td><td>ship collision accident</td></tr><tr><td>Accident severity</td><td>collapsing</td><td>moderate damage</td><td>slight damage</td></tr><tr><td>Bridge structure</td><td>beam bridge</td><td>beam bridge</td><td>beam bridge</td><td rowspan="8">General circle layer</td></tr><tr><td>Bridge materials</td><td>reinforced concrete bridge</td><td>reinforced concrete bridge</td><td>reinforced concrete bridge</td></tr><tr><td>Accident position</td><td>bridge deck</td><td>bridge deck</td><td>bridge pier</td></tr><tr><td>Accident season</td><td>summer</td><td>spring</td><td>spring</td></tr><tr><td>Accident time period</td><td>forenoon</td><td>afternoon</td><td>noon</td></tr><tr><td>Accident area</td><td>east China region</td><td>southwest region</td><td>east China region</td></tr><tr><td>Accident location (city)</td><td>Liu'an City, Anhui Province</td><td>Wenchuan County, Sichuan Province</td><td>Shanghai</td></tr><tr><td>Level ofaccident area</td><td>prefecture-level City</td><td>county-level cities</td><td>municipalities directly under the central government</td></tr></tbody></table>

[https://doi.org/10.1371/journal.pone.0294130.t007](https://doi.org/10.1371/journal.pone.0294130.t007)

Table 8. The retrieval results of the case “7.7”.

<table><tbody><tr><td colspan="2">The core circle layer</td><td colspan="2">The general circle layer</td><td rowspan="2">The global similarity</td></tr><tr><td>The retrieval case</td><td>The similarity</td><td>The retrieval case</td><td>The similarity</td></tr><tr><td>64</td><td>0.9000</td><td>240</td><td>0.1</td><td>1.0000</td></tr><tr><td>256</td><td>0.9000</td><td>228</td><td>0.0829</td><td>0.9829</td></tr><tr><td>116</td><td>0.9000</td><td>193</td><td>0.0747</td><td>0.9747</td></tr><tr><td>114</td><td>0.9000</td><td>244</td><td>0.0747</td><td>0.9747</td></tr><tr><td>113</td><td>0.9000</td><td>64</td><td>0.0709</td><td>0.9709</td></tr><tr><td>147</td><td>0.9000</td><td></td><td></td><td></td></tr><tr><td>30</td><td>0.9000</td><td></td><td></td><td></td></tr><tr><td>244</td><td>0.9000</td><td></td><td></td><td></td></tr><tr><td>310</td><td>0.9000</td><td></td><td></td><td></td></tr><tr><td>228</td><td>0.9000</td><td></td><td></td><td></td></tr><tr><td>46</td><td>0.9000</td><td></td><td></td><td></td></tr><tr><td>193</td><td>0.9000</td><td></td><td></td><td></td></tr><tr><td>47</td><td>0.9000</td><td></td><td></td><td></td></tr><tr><td>179</td><td>0.9000</td><td></td><td></td><td></td></tr><tr><td>321</td><td>0.9000</td><td></td><td></td><td></td></tr></tbody></table>

[https://doi.org/10.1371/journal.pone.0294130.t008](https://doi.org/10.1371/journal.pone.0294130.t008)

Sichuan Province" have similar cases like " No.174 case" "No.42 case" and "No.45 case", all of which are bridge accidents caused by earthquakes. Finally, the "6.23 Ship Collision Accident of Jinshan Hengxi East Street Bridge in Shanghai" has similar cases such as " No.35 case" " No.76 case" and " No.77 case", all of which are bridge accidents caused by vessel collisions. These similar cases have relatively high match scores, and the differences in overall similarity usually come from the differences in some individual general-level nodes. By using the similarity matching verification process in this study, it can effectively find the most similar cases to the target case, which provides powerful support for subsequent case-assisted decision-making. These results demonstrate that the proposed case-matching method is highly reliable and effective.

Table 9. The retrieval results for the 3 target cases.

| Target case | Top 5 matching cases | The global similarity |
| --- | --- | --- |
| 240 (7.7) | 240 | 1.0000 |
|  | 228 | 0.9829 |
|  | 193 | 0.9747 |
|  | 244 | 0.9747 |
|  | 64 | 0.9709 |
| 175 (5.12) | 175 | 1.0000 |
|  | 174 | 0.8462 |
|  | 42 | 0.8392 |
|  | 45 | 0.8370 |
|  | 43 | 0.8370 |
| 103 (6.23) | 103 | 1.0000 |
|  | 35 | 0.9829 |
|  | 76 | 0.9652 |
|  | 77 | 0.9621 |
|  | 311 | 0.9565 |

[https://doi.org/10.1371/journal.pone.0294130.t009](https://doi.org/10.1371/journal.pone.0294130.t009)

Furthermore, in the "3.3 Case Retrieval Validation" section, the multi-circle layer retrieval strategy (with n = 10 and k = 5) successfully matches a total of 1052 nodes based on the number of matching nodes. However, the nearest neighbor retrieval algorithm would require matching a total of 3564 nodes. Compared to the nearest neighbor matching algorithm, the retrieval strategy proposed in this paper can eliminate a large number of irrelevant cases in the first matching, resulting in a significantly lower total number of matched nodes. In contrast, traditional nearest neighbor algorithms require traversing all case nodes, resulting in lower matching efficiency. Therefore, the method proposed in this paper can improve the efficiency and accuracy of case matching.

However, the research in this paper still has some limitations. In the field of bridge accident cases, the application of knowledge graph construction technology is still in its early stages. Although the method proposed in this paper establishes a knowledge graph-based bridge accident case base, further collection of more case samples is needed to enrich the case repository. It should be noted that this research has only collected 324 cases, which limits the utilization of the current BOAKG. The scope of this study is limited to accidents that occur during the operation of bridges in China. Future research can expand the scope of study to compare bridge accident cases and response measures in different countries or regions. To achieve this goal, more efficient case representation methods and multi-source information fusion techniques need to be considered. The cases should be collected as many as possible, including detailed information on accident precursors, causes, processes, outcomes, and response measures. Besides, the establishment of a cross-lingual, cross-cultural bridge accident data standard and fusion approach should be adopted. In this study, the BOAKG is designed as an open network capable of continuously accumulating new cases over time. This means that as more bridge operational accident cases are added to the knowledge graph, its utility and effectiveness in case retrieval will increase, further enhancing the knowledge base for future decision-making and response management.

## Conclusions

Case representation and similar case retrieval are the key contents of understanding bridge operational accidents and conducting automated reasoning. In terms of case representation, a knowledge graph has been adopted to facilitate the multi-dimensional network modeling of bridge operational accidents. This approach addresses the current situation where these accidents are primarily stored in unstructured documents, resulting in low efficiency and effective ness in information retrieval. The established BOAKG organizes the knowledge related to bridge operational accidents in a structured and orderly manner, drawing upon principles from knowledge engineering. Its purpose is to process and store knowledge in a more systematic way. It enables automated and rapid information retrieval for cases, as well as facilitating the visualization display of case information. The BOAKG serves as a database for subsequent case retrieval tasks. CBR is a valuable method for analyzing bridge operational accidents. An innovative multi-circle layer retrieval strategy based on CBR has been proposed for case retrieval. The multi-circle layer retrieval strategy proposed in this study demonstrates high retrieval efficiency and feasibility for case retrieval. The results of the retrieval demonstrate that the global similarity can exceed 0.8000, indicating the feasibility of the case retrieval algo rithm and an acceptable retrieval effect. Besides, by increasing the number and diversity of cases in the database, the retrieval results can be subsequently optimized.

The study expands the application scope of knowledge graph and CBR from a theoretical perspective and explores the mechanism of combining these two methods to achieve intelligent decision-making for infrastructure operational risks. In practical terms, this research

provides a valuable methodology for bridge operation management departments, particularly in the context of risk intelligent management. Additionally, it can also serve as a reference for risk management in other infrastructure operations. The innovation of this study is twofold. Firstly, it lies in the research content, which focuses on bridge operational risk by analyzing cases of bridge operational accidents. This approach contributes to a deeper understanding of bridge operational risks. Secondly, the study innovates in terms of research methodology by utilizing knowledge graph technology from the field of artificial intelligence and integrating it with CBR technology. Notably, the paper introduces a novel multi-layer retrieval strategy in the application of CBR, which enhance the efficiency and effectiveness of case retrieval.

## Author Contributions

**Conceptualization:** Hui Xu, Yuxi Wei, Yonggang Cai.

**Data curation:** Yuxi Wei, Yonggang Cai.

**Formal analysis:** Yonggang Cai.

**Funding acquisition:** Hui Xu.

**Investigation:** Yuxi Wei, Yonggang Cai.

**Methodology:** Hui Xu, Yonggang Cai.

**Project administration:** Hui Xu.

**Resources:** Hui Xu.

**Software:** Yonggang Cai.

**Supervision:** Hui Xu.

**Validation:** Yonggang Cai.

**Visualization:** Yonggang Cai, Bin Xing.

**Writing – original draft:** Hui Xu.

**Writing – review & editing:** Hui Xu, Bin Xing.

## References

1. Gao Y, Fan Y, Wang J, Duan Z. Evaluation of governmental safety regulatory functions in preventing major accidents in China. Saf Sci. 2019; 120:299–311. [https://doi.org/10.1016/j.ssci.2019.07.002](https://doi.org/10.1016/j.ssci.2019.07.002)

2. Liu J, Schmid F, Li K, Zheng W. A knowledge graph-based approach for exploring railway operational accidents. Reliab Eng Syst Saf. 2021; 207: 107352. [https://doi.org/10.1016/j.ress.2020.107352](https://doi.org/10.1016/j.ress.2020.107352)

3. Kaeeni S, Khalilian M, Mohammadzadeh J. Derailment accident risk assessment based on ensemble classification method. Saf Sci. 2018; 110:3–10. [https://doi.org/10.1016/j.ssci.2017.11.006](https://doi.org/10.1016/j.ssci.2017.11.006)

4. Meng Y, Tian X, Li Z, Zhou W, Zhou Z, Zhong M. Comparison analysis on complex topological network models of urban rail transit: A case study of Shenzhen Metro in China. Physica A. 2020; 559:125031. [https://doi.org/10.1016/j.physa.2020.125031](https://doi.org/10.1016/j.physa.2020.125031)

5. Peng FL, Qiao YK, Yang C. Building a knowledge graph for operational hazard management of utility tunnels. Expert Syst Appl. 2023; 223:119901. [https://doi.org/10.1016/j.eswa.2023.119901](https://doi.org/10.1016/j.eswa.2023.119901)

6. Xu H, Liao H, Tan Y, Xing B, Hou B. Intelligent Exploration of Construction Accidents Based on Knowledge Graph. E3S Web of Conferences; 2023 Aug 3–4; Cape Town, Republic of South Africa. 2023; 409: 04002. [https://doi.org/10.1051/e3sconf/202340904002](https://doi.org/10.1051/e3sconf/202340904002)

7. Sheth A, Padhee S, Gyrard A. Knowledge Graphs and Knowledge Networks: The Story in Brief. IEEE Internet Comput. 2019; 23(4):67–75. [https://doi.org/10.1109/mic.2019.2928449](https://doi.org/10.1109/mic.2019.2928449)

8. Yu F, Li XY, Han XS. Risk response for urban water supply network using case-based reasoning during a natural disaster. Saf Sci. 2018; 106:121–139. [https://doi.org/10.1016/j.ssci.2018.03.003](https://doi.org/10.1016/j.ssci.2018.03.003)

9. Elvik R, Sagberg F, Langeland PA. An analysis of factors influencing accidents on road bridges in Norway. Accid Anal Prev. 2019; 129:1–6. Epub 2019/05/13. [https://doi.org/10.1016/j.aap.2019.05.002](https://doi.org/10.1016/j.aap.2019.05.002)PMID: [31078947](http://www.ncbi.nlm.nih.gov/pubmed/31078947).

10. Liu J, Schmid F, Zheng W, Zhu J. Understanding railway operational accidents using network theory. Reliab Eng Syst Saf. 2019; 189:218–231. [https://doi.org/10.1016/j.ress.2019.04.030](https://doi.org/10.1016/j.ress.2019.04.030)

11. Zhou JL, Lei Y. Paths between latent and active errors: Analysis of 407 railway accidents/incidents causes in China. Saf Sci. 2018; 110:47–58. [https://doi.org/10.1016/j.ssci.2017.12.027](https://doi.org/10.1016/j.ssci.2017.12.027)

12. Hughes P, Robinson R, Figueres-Esteban M, Van Gulijk C. Extracting safety information from multi-lingual accident reports using an ontology-based approach. Saf Sci. 2019; 118:288–297. [https://doi.org/10.1016/j.ssci.2019.05.029](https://doi.org/10.1016/j.ssci.2019.05.029)

13. Shi Y, Zhao L, Zhou M, Yin X, Guo W, Li C. A dynamic community gas risk-prediction method based on temporal knowledge graphs. Process Saf Environ Prot. 2023; 177:436–445. [https://doi.org/10.1016/j.psep.2023.07.004](https://doi.org/10.1016/j.psep.2023.07.004)

14. Chen Y, Zhang L, Hu J, Chen C, Fan X, Li X. An emergency task recommendation model of long-distance oil and gas pipeline based on knowledge graph convolution network. Process Saf Environ Prot. 2022; 167:651–661. [https://doi.org/10.1016/j.psep.2022.09.050](https://doi.org/10.1016/j.psep.2022.09.050)

15. Liu C, Yang S. Using text mining to establish knowledge graph from accident/incident reports in risk assessment. Expert Syst Appl. 2022; 207:117991. [https://doi.org/10.1016/j.eswa.2022.117991](https://doi.org/10.1016/j.eswa.2022.117991)

16. Tian L, Zhou X, Wu YP, Zhou WT, Zhang JH, Zhang TS. Knowledge graph and knowledge reasoning: A systematic review. J Electron Sci Technol. 2022; 20(2): 100159. [https://doi.org/10.1016/j.jnlest.2022.100159](https://doi.org/10.1016/j.jnlest.2022.100159)

17. Guo BHW, Goh YM. Ontology for design of active fall protection systems. Autom Constr. 2017; 82:138–153. [https://doi.org/10.1016/j.autcon.2017.02.009](https://doi.org/10.1016/j.autcon.2017.02.009)

18. Fang W, Ma L, Love PED, Luo H, Ding L, Zhou A. Knowledge graph for identifying hazards on construction sites: Integrating computer vision with ontology. Autom Constr. 2020; 119:103310. [https://doi.org/10.1016/j.autcon.2020.103310](https://doi.org/10.1016/j.autcon.2020.103310)

19. Wu W, Wen C, Yuan Q, Chen Q, Cao Y. Construction and application of knowledge graph for construction accidents based on deep learning. Eng Constr Archit Manag. 2023. [https://doi.org/10.1108/ecam-03-2023-0255](https://doi.org/10.1108/ecam-03-2023-0255)

20. Gan L, Ye B, Huang Z, Xu Y, Chen Q, Shu Y. Knowledge graph construction based on ship collision accident reports to improve maritime traffic safety. Ocean Coast Manag. 2023; 240:106660. [https://doi.org/10.1016/j.ocecoaman.2023.106660](https://doi.org/10.1016/j.ocecoaman.2023.106660)

21. Chen J, Lu Y, Zhang Y, Huang F, Qin J. A management knowledge graph approach for critical infrastructure protection: Ontology design, information extraction and relation prediction. Int J Crit Infrastruct Prot. 2023; 43:100634. [https://doi.org/10.1016/j.ijcip.2023.100634](https://doi.org/10.1016/j.ijcip.2023.100634)

22. Pan X, Zhong B, Wang Y, Shen L. Identification of accident-injury type and bodypart factors from construction accident reports: A graph-based deep learning framework. Adv Eng Inf. 2022; 54:101752. [https://doi.org/10.1016/j.aei.2022.101752](https://doi.org/10.1016/j.aei.2022.101752)

23. Wang X, El-Gohary N. Deep learning-based relation extraction and knowledge graph-based representation of construction safety requirements. Autom Constr. 2023; 147: 104696. [https://doi.org/10.1016/j.autcon.2022.104696](https://doi.org/10.1016/j.autcon.2022.104696)

24. Aha DW. The omnipresence of case-based reasoning in science and application. Knowl Based Syst. 1998; 11(5–6):261–273.

25. Aamodt A, Plaza E. Case-based reasoning: Foundational issues, methodological variations, and system approaches. AI Commun. 1994; 7(1):39–59.

26. Lu Y, Yin L, Deng Y, Wu GC, Li C. Using cased based reasoning for automated safety risk management in construction industry. Saf Sci. 2023; 163:106113. [https://doi.org/10.1016/j.ssci.2023.106113](https://doi.org/10.1016/j.ssci.2023.106113)WOS:000961814900001.

27. Goh YM, Guo BHW. FPSWizard: A web-based CBR-RBR system for supporting the design of active fall protection systems. Autom Constr. 2018; 85:40–50. [https://doi.org/10.1016/j.autcon.2017.09.020](https://doi.org/10.1016/j.autcon.2017.09.020)

28. Fan ZP, Li YH, Zhang Y. Generating project risk response strategies based on CBR: A case study. Expert Syst Appl. 2015; 42(6):2870–2883. [https://doi.org/10.1016/j.eswa.2014.11.034](https://doi.org/10.1016/j.eswa.2014.11.034)

29. Chen WT, Chang PY, Chou K, Mortis LE. Developing a CBR-based adjudication system for fatal construction industry occupational accidents. Part I: Building the system framework. Expert Syst Appl. 2010; 37(7):4867–4880. [https://doi.org/10.1016/j.eswa.2009.12.028](https://doi.org/10.1016/j.eswa.2009.12.028)

30. Liu J, Li H, Skitmore M, Zhang Y. Experience mining based on case-based reasoning for dispute settlement of international construction projects. Autom Constr. 2019; 97:181–191. [https://doi.org/10.1016/j.autcon.2018.11.006](https://doi.org/10.1016/j.autcon.2018.11.006)

31. Ayhan BU, Tokdemir OB. Safety assessment in megaprojects using artificial intelligence. Saf Sci. 2019; 118:273–287. [https://doi.org/10.1016/j.ssci.2019.05.027](https://doi.org/10.1016/j.ssci.2019.05.027)

32. Liu K, Ergu D, Cai Y, Gong B, Sheng J. A New Approach to Process the Unknown Words in Financial Public Opinion. Procedia Comput Sci. 2019; 162: 523–531.

33. Wang Y, Zhang D, Yuan Y, Liu Q, Yang Y. Improvement of TF-IDF algorithm based on knowledge graph. 2018 IEEE 16th International Conference on Software Engineering Research, Management and Applications (SERA); 2018; Kunming, China. 2018: 19–24.

34. Wang Z, Wang D, Li Q. Keyword Extraction from Scientific Research Projects Based on SRP-TF-IDF. Chin J Electron. 2021; 30(4):652–657. [https://doi.org/10.1049/cje.2021.05.007](https://doi.org/10.1049/cje.2021.05.007)

35. Xiao H, Wang L, Cui C. Research on emergency management of urban waterlogging based on similarity fusion of multi-source heterogeneous data. PLoS One. 2022; 17(7):e0270925. Epub 2022/07/08. [https://doi.org/10.1371/journal.pone.0270925](https://doi.org/10.1371/journal.pone.0270925) PMID: [35797396](http://www.ncbi.nlm.nih.gov/pubmed/35797396); PubMed Central PMCID: PMC9262222.

36. Pous de la Flor J, Castañeda MC, Arlandi M, Ordás F, Pous Cabello J. AHP algorithm used to select suitable abandoned underground mines for energy storage infrastructure–iCAES technology. A specific case study for León (Spain). Heliyon. 2023. [https://doi.org/10.1016/j.heliyon.2023.e20045](https://doi.org/10.1016/j.heliyon.2023.e20045) PMID: [37809878](http://www.ncbi.nlm.nih.gov/pubmed/37809878)

37. Han G, Feng G, Tang C, Pan C, Zhou W, Zhu J. Evaluation of the ventilation mode in an ISO class 6 electronic cleanroom by the AHP-entropy weight method. Energy. 2023; 284: 128586. [https://doi.org/10.1016/j.energy.2023.128586](https://doi.org/10.1016/j.energy.2023.128586)

38. He Y, Lou R, Wang Y, Wang J, Fang X. A dual attribute weighted decision fusion system for fault classification based on an extended analytic hierarchy process. Eng Appl Artif Intell. 2022; 114:105066. [https://doi.org/10.1016/j.engappai.2022.105066](https://doi.org/10.1016/j.engappai.2022.105066)

39. Gangwar AK, Shaik AG. k-Nearest neighbour based approach for the protection of distribution network with renewable energy integration. Electr Power Syst Res. 2023; 220:109301. [https://doi.org/10.1016/j.epsr.2023.109301](https://doi.org/10.1016/j.epsr.2023.109301)

40. Song X, Xie T, Fischer S. Accelerating kNN search in high dimensional datasets on FPGA by reducing external memory access. Future Gener Comput Syst. 2022; 137:189–200. [https://doi.org/10.1016/j.future.2022.07.009](https://doi.org/10.1016/j.future.2022.07.009)

41. Haq IU, Khan DM, Hamraz M, Iqbal N, Ali A, Khan Z. Optimal -k nearest neighbours based ensemble for classification and feature selection in chemometrics data. Chemometrics Intellig Lab Syst. 2023; 240:104882. [https://doi.org/10.1016/j.chemolab.2023.104882](https://doi.org/10.1016/j.chemolab.2023.104882)

42. Huo Y, Liu J, Xiong J, Xiao W, Zhao J. Machine learning and CBR integrated mechanical product design approach. Adv Eng Inf. 2022; 52:101611. [https://doi.org/10.1016/j.aei.2022.101611](https://doi.org/10.1016/j.aei.2022.101611)

43. Chen M, Qu R, Fang W. Case-based Reasoning System for Fault Diagnosis of Aero-engines. Expert Syst Appl. 2022; 202:117350. [https://doi.org/10.1016/j.eswa.2022.117350](https://doi.org/10.1016/j.eswa.2022.117350)

44. Lu Y, Li Q, Xiao W. Case-based reasoning for automated safety risk analysis on subway operation: Case representation and retrieval. Saf Sci. 2013; 57:75–81. [https://doi.org/10.1016/j.ssci.2013.01.020](https://doi.org/10.1016/j.ssci.2013.01.020)

45. Silva GC, Carvalho EEO, Caminhas WM. An artificial immune systems approach to Case-based Reasoning applied to fault detection and diagnosis. Expert Syst Appl. 2020; 140:112906. [https://doi.org/10.1016/j.eswa.2019.112906](https://doi.org/10.1016/j.eswa.2019.112906)

46. Fan ZP, Li YH, Wang X, Liu Y. Hybrid similarity measure for case retrieval in CBR and its application to emergency response towards gas explosion. Expert Syst Appl. 2014; 41(5):2526–2534. [https://doi.org/10.1016/j.eswa.2013.09.051](https://doi.org/10.1016/j.eswa.2013.09.051)

47. Shen L, Li J, Suo W. Risk response for critical infrastructures with multiple interdependent risks: A scenario-based extended CBR approach. Comput Ind Eng. 2022; 174:108766. [https://doi.org/10.1016/j.cie.2022.108766](https://doi.org/10.1016/j.cie.2022.108766)

48. Duan J, Lin Z, Jiao F, Jiang Y, Chen K. A dynamic case-based reasoning system for responding to infectious disease outbreaks. Expert Syst Appl. 2022; 204:117628. [https://doi.org/10.1016/j.eswa.2022.117628](https://doi.org/10.1016/j.eswa.2022.117628)

49. Wu Q, Sun H, Sun N. Design of Aircraft Accident Case Base Construction based on Frame Representation Method. Institute of Management Science and Industrial Engineering.Proceedings of 2019 International Conference on Aviation Safety and Information Technology(ICASIT 2019); 2019 Oct 17; China. 2019:4.

50. Rungsawang A, Angkawattanawit N. Learnable topic-specific web crawler. J Netw Comput Appl. 2005; 28(2):97–114. [https://doi.org/10.1016/j.jnca.2004.01.001](https://doi.org/10.1016/j.jnca.2004.01.001)