<!--
SOURCE: 原始 PDF: reference/材料-性能关系/Huang 等 - 2023 - Analysis of Modulus Properties of High-Modulus Asphalt Mixture and Its New Evaluation Index of Rutti.pdf | 页数: 20 | 集合: reference
题录: litfull-089 Analysis of Modulus Properties of High-Modulus Asphalt Mixture and Its New Evaluation Index of Rutting Resistance (DOI: 10.3390/su15097574)
提取: MinerU markdown 全文（可重建索引的真相源副本；images/ 不入 corpus）
-->

Article

# Analysis of Modulus Properties of High-Modulus Asphalt Mixture and Its New Evaluation Index of Rutting Resistance

**Guojing Huang** <strong><sup>1</sup></strong>**, Jiupeng Zhang** <strong><sup>1</sup></strong>**, Bing Hui** <strong><sup>1</sup></strong>**,\*, Hongfei Zhang** <strong><sup>1</sup></strong>**,\*, Yongsheng Guan** <strong><sup>2</sup></strong>**, Fucheng Guo** <strong><sup>1</sup></strong>**, Yan Li** <strong><sup>1</sup></strong>, **Yinzhang He** <strong><sup>1</sup></strong> **and Di Wang** <strong><sup>3,4</sup></strong>

1 School of Highway, Chang’an University, Xi’an 710064, China

2 Jiangsu Sinoroad Engineering Research Institute Co., Ltd., Nanjing 211805, China

3 Department of Civil Engineering, Aalto University, 02150 Espoo, Finland

Hangzhou Telujie Transportation Technology Co., Ltd., Hangzhou 311121, China

\* Correspondence: huibing@chd.edu.cn (B.H.); zhhongfei@chd.edu.cn (H.Z.)

![](images/page_0_image_11.jpg)

**Citation:** Huang, G.; Zhang, J.; Hui, B.; Zhang, H.; Guan, Y.; Guo, F.; Li, Y.; He, Y.; Wang, D. Analysis of Modulus Properties of High-Modulus Asphalt Mixture and Its New Evaluation Index of Rutting Resistance. Sustainability **2023**, 15, 7574. [https://doi.org/10.3390/su15097574](https://doi.org/10.3390/su15097574)

Academic Editor: Rui Micaelo

Received: 18 March 2023 Revised: 1 May 2023 Accepted: 3 May 2023 Published: 5 May 2023

![](images/page_0_image_15.jpg)

**Copyright:** © 2023 by the authors. Licensee MDPI, Basel, Switzerland. This article is an open access article distributed under the terms and conditions of the Creative Commons Attribution (CC BY) license ([https://creativecommons.org/licenses/by/](https://creativecommons.org/licenses/by/4.0/)4.0/).

**Abstract:** High-modulus asphalt mixture (HMAM) is one of the most effective materials to enhance the rutting resistance of asphalt pavement and upgrade pavement sustainability. The objectives of this study are to investigate the modulus properties of different HMAMs and their correlation with the rutting resistance, to propose reasonable modulus evaluation indicators, and to analyze the rutting resistance mechanisms of different materials (hard asphalt, polyethylene, dissolved polyolefin). The effect of three HMAMs and two styrene-butadiene-styrene (SBS) modifiers on asphalt mixtures rutting resistance were evaluated by dynamic modulus test and wheel track test, and the results were simulated and further analyzed via ABAQUS. The results indicate that the dynamic modulus of the mixtures showed a gradual increase and decrease with the increase of loading frequency and testing temperature, respectively. The ratio of dynamic modulus in low frequency to that in high frequency correlates well with dynamic stability under high-temperature conditions, and the wider the frequency coverage, the higher the correlation between this ratio and dynamic stability. The rutting resistance of asphalt pavements can be improved by reducing the frequency sensitivity of HMAMs under high temperatures or by increasing the modulus’ absolute value of the pavement structural layer. Therefore, two indicators, the absolute value of the modulus and the ratio of 0.1 Hz dynamic modulus to 25 Hz dynamic modulus at $5 5 ~ ^ { \circ } \mathbf { C } ,$ are recommended for the evaluation of rutting resistance of HMAMs. Based on the evaluation indexes proposed in this paper, a comparative analysis of the rutting resistance mechanism of HMAMs prepared with different materials was carried out, and it was concluded that the mixture with high-modulus agents had the best rutting resistance, which is consistent with the test road observations, thus verifying the feasibility of the modulus evaluation indexes recommended in this paper for the evaluation of the rutting resistance of different types of HMAMs.

**Keywords:** high-modulus asphalt mixture; dynamic modulus; pavement structure; rutting resistance

## 1. Introduction

The design concept of high-modulus asphalt mixtures was first introduced in France in the 1960s to resist the pavement rutting with the increasing heavy traffic [1–4]. HMAM reduces the plastic deformation of asphalt concrete under vehicle load by increasing the modulus of asphalt concrete (the requirement for dynamic modulus is above 14 GPa at a testing temperature of $1 5 \; ^ { \circ } \mathsf { C }$ with the loading frequency of 10 Hz), thus enhancing the rutting resistance of the pavement, improving the fatigue resistance of asphalt concrete and extending the service life of the pavement, which makes it an ideal material for the construction of long-life pavements [5–9]. Nevertheless, the service performance of HMAM varies considerably from region to region due to factors such as binder types, additive types, the climatic characteristics of each country, and the different design methods of asphalt mixture [1,10]. Further clarification of the correlation between the rutting resistance and modulus properties of different HMAMs, analysis of the rutting resistance mechanism of HMAM, and the proposal of reasonable rutting resistance evaluation indexes are conducive to accelerating the global promotion and application of HMAM, which is also the focus of this study.

There are three ways to prepare HMAM: using low penetration grade asphalt, natural asphalt, and adding high-modulus modifiers based on polyolefins, such as polyethylene (PE), polypropylene (PP), etc. [5,11]. The road performance (especially rutting resistance) of HMAMs prepared in different ways varies considerably, and much attention has been paid to this aspect. Zhang and Sun evaluated the performance of low-grade hard asphalt using different design methods and showed that the hard HMAs designed using the EME (Enrobé à Module Élevé, a French design method for high-modulus asphalt concrete) method have good rutting resistance and long fatigue life [12]. Similar conclusions were reached in a study by Corte and Khiavi, where the rutting resistance of hard asphalt HMAM was better than that of SBS asphalt mixtures [12,13]; Wang compared two different high-modulus asphalt binders (HMAB) prepared from rock asphalt and polyolefin., and found that the rutting resistance of both HMABs was better than that of SBS-modified asphalt, and the polyolefin-modified HMAB had higher rutting resistance than the rock asphalt-modified HMAB, while the comparison of fatigue resistance showed opposite results [14]. Zou et al. prepared HMAM with different dosing levels using two high-modulus external dopants, PR PLAST S®(PRS) and PR PLAST Module® (PRM). The study showed that PRS and PRM significantly improved the rutting resistance and fatigue resistance of HMAM and slightly improved the cracking resistance of HMAM at low temperatures, while it was suggested that the content of PRM and the PRS should be 10% of the weight of the asphalt binder, respectively [15,16]. However, studies by Moghaddam, Rys, and Judycki have shown that, although additive HMAM has good rutting resistance, it also increases the chances of pavement cracking [17–19]. In summary, HMAMs prepared in different ways all have excellent rutting resistance, ranked from high to low: external additive HMAM, natural asphalt HMAM, and low penetration grade asphalt HMAM; the fatigue resistance of HMAM is better than conventional mixtures, but lower than SBS-modified mixtures; the low-temperature performance is generally poor and prone to thermal cracking. However, existing studies only investigated the differences in performance of different HMAMs and lacked an analysis of the intrinsic mechanisms that lead to differences in rutting resistance.

The study of the modulus properties of HMAM is essential for analyzing the mechanical response of HMAM and the reasons for the reduction in pavement rutting. The dynamic modulus can well represent the stress–strain response of the actual pavement under dynamic wheel loading, which is an important indicator for evaluating the modulus performance of HMAM [8,20–23]. Yan et al. prepared seven mixtures using natural asphalt (rock asphalt, lake asphalt) blended with SBS asphalt and low penetration grade hard asphalt and found that all produced the expected HMAM (dynamic modulus around 15 GPa) through the dynamic modulus parameters of the seven mixtures [24]. Zhu et al. tested the dynamic modulus of HMAM prepared from low-grade asphalt with different reclaimed asphalt pavement (RAP) contents and found that HMAM with 40% content of RAP had the best modulus properties [25]. The mechanical properties of additive-based HMAM were also evaluated using the dynamic modulus index in studies by Ma [2], Xiao [26,27], Moghaddam [28], and other scholars, and it was found that the dynamic modulus of HMAM with high = modulus agent particles showed a large increase compared to SBS = modified asphalt and normal asphalt mixtures, and the increase in modulus was related to the additive brand, with the average value around 16 GPa [1,29–31]. It can be seen that existing studies have only used the dynamic modulus for the evaluation of HMAM modulus performance, and the correlation between road performance and dynamic modulus of HMAM has not been clarified. Moreover, researchers have conducted in-depth studies on the testing methods, accuracy, prediction models, and performance-related indicators for dynamic modulus [1,32,33]. Specifically, in terms of evaluation indicators for pavement rutting, most scholars believe that dynamic modulus correlates well with rutting stability and some evaluation indicators were recommended [34–36]. However, some studies have also reported that dynamic modulus has little or no effect on rutting [37,38]. It is worth noting that these studies are mainly conducted on normal hot asphalt mixtures. Studies on the correlation between dynamic modulus and rutting performance of HMAM are still limited. The high-modulus asphalt mixtures have all changed in viscoelastic charac teristics due to the use of hard asphalt, natural asphalt, and external agents. It is necessary to carry out a comparative study of the effect of different material compositions on the viscoelasticity of asphalt mixtures in conjunction with the dynamic modulus test.

As stated in the paragraphs above, studies on the comparative analysis of the dynamic modulus properties of different types of HMAMs and their correlation with the rutting resistance of HMAMS are limited. Moreover, little study to date has evaluated of the rutting resistance of HMAMs based on reasonable modulus indicators. The objectives of this study are to investigate the modulus properties of different HMAMs and their correlation with the rutting resistance, to propose reasonable modulus evaluation indicators, and to analyze the rutting resistance mechanisms of different materials (hard asphalt, polyethylene, dissolved polyolefin) through a combination of experimental and simulation methods. Three groups of HMAMs and two groups of reference mixtures were prepared by using high-modulus agent, low-grade asphalt, and SBS-modified asphalt. The correlation between dynamic modulus and anti-rutting deformation of HMAM under different external conditions (temperature and loading frequency) was studied. The modulus index that can reliably describe the mechanical properties and rutting resistance of HMAM was proposed, and the anti-rutting mechanism of different types of HMAMs was compared and analyzed. The results of the study could have a great contribution to the selection of different types of HMAMs in various regions and to the improvement and evaluation of rutting resistance of HMAM pavement.

## 2. Materials and Methods

## 2.1. Raw Materials

In this study, Pen 70 base asphalt, SBS-modified asphalt, and a kind of hard asphalt (two grades of asphalt with a penetration of 15–25/0.1 mm or 10–20/0.1 mm in accordance with European Standard EN-13924) [18,39] were added into five types of mixtures. Pen 70 base asphalt and SBS-modified asphalt (the mass ratio of SBS to base asphalt is 5%) were provided by local contractor, and the hard asphalt was compounded by a hard asphalt modifier produced by Sinopec and Pen 70 base asphalt (the mass ratio of Pen 70 base asphalt to hard asphalt modifier is 7:3). The basic properties of the three control binders are shown in Table 1, all of which meet the requirements of the Chinese standard JTG F40-2004 [40]. The test methods are given in Chinese specification JTG E20-2011 [41].

Table 1. Properties of asphalt binder.

| Technical Indexes | Unit | Pen 70 Base Asphalt | Hard Asphalt | SBS-Modified Asphalt |
| --- | --- | --- | --- | --- |
| Penetration (25 ◦C) | 0.1 mm | 77.6 | 14 | 70 |
| Ductility | cm | 38 (10 ◦C) | 41 (25 ◦C) | 40 (5 ◦C) |
| Softening point (R&amp;B) | ◦C | 47 | 65 | 78 |
| Viscosity at 135 ◦C | Pa·s | 0.40 | 1.55 | 2.10 |

Two types of commercial high-modulus agents were used in this study, including a PE additive (named HM1) and a soluble polyolefin additive (named HM2). The basic properties of the two agents are shown in Table 2. The combination of HM1 and base asphalt is widely used in China, but it cannot be completely dissolved in asphalt and has poor adhesion to aggregate. HM2 can be completely dissolved in asphalt, which has good rutting resistance and construction workability, but poor elastic recovery performance. It is recommended to combine it with SBS-modified asphalt. In this study, the two highmodulus agents are applied as follows: firstly, a certain amount of HM1 and HM2 is slowly added to the base asphalt and SBS-modified asphalt (preheated to $1 5 5 \; ^ { \circ } \mathbf { C }$ and then kept at a constant temperature), respectively, then sheared for 60 min at a shear temperature of $1 8 0 \; ^ { \circ } \mathbf { C }$ and a shear rate of 4500 r/min using high-speed shear equipment, and finally held in a thermostat at $1 7 0 \; ^ { \circ } \mathbf { C }$ for 2 h. The properties of modified asphalt binders are shown in Table 3, and it can be seen that their basic performance and storage stability meet the requirements of the current specification and can be used for subsequent tests.

Table 2. Basic properties of HMAM additives.

| Items | Additive HM1 | Additive HM2 | Requirements |
| --- | --- | --- | --- |
| Appearance | Black particles | Black particles | / |
| Size/mm | ≤5 | ≤4 | / |
| Density/g/cm<sup>3</sup> | 0.95 | 0.94 | / |
| Main melting peak temperature (◦C) | 124 | 126 | 100~160 |
| Secondary melting peak temperature (◦C) | / | 161.5 | / |
| Melt mass flow rate (g/10 min) | 1.24 | 5.52 | 1~6 |

Notes: Both HM1 and HM2 were provided by local contractors in China.

Table 3. Properties of modified asphalt binders.

| Technical Indexes | Unit | HM1-ModifiedAsphalt | HM2-ModifiedAsphalt |
| --- | --- | --- | --- |
| Penetration (25 ◦C) | 0.1 mm | 48.2 | 32.1 |
| Ductility (5 ◦C) | cm | 5.1 | 15.6 |
| Softening point (R&amp;B) | ◦C | 56.2 | >90 |
| Viscosity at 135 ◦C | Pa·s | 1.88 | 2.25 |
| Softening point difference | ◦C | 2.1 | 1.4 |

The coarse and fine aggregates and fillers used in this study were all limestones produced by quarries in Shangluo, China. The coarse aggregate (particle size greater than 2.36 mm) should be clean, dry, and have a rough surface. The fine aggregates (particle size less than 2.36 mm) are mainly used to fill the gaps in the coarse aggregate skeleton and are required to be clean, dry, and free from weathering and impurities. The fillers are mineral powders with a particle size of less than 0.075 mm and are made from limestone that has been ground finely. The main technical properties of the aggregates are shown in Table 4, and all met the current specification JTG F40-2004 [40]. The test methods can be found in Chinese specification JTG E20-2011 [41].

Table 4. The main technical properties of aggregates.

|  | Testing Item | Unit | Testing Value | Requirements |
| --- | --- | --- | --- | --- |
| Course | Apparent relative density Los Angeles abrasion loss Index of crushing | g/cm<sup>3</sup>%% | 2.79311.415.7 | ≥2.5≤30≤28 |
| aggregate | Needle flake content Adhesion degree Firmness | %/% | 1252.6 | ≤18≥4≤12 |
| Fine aggregate | Apparent relative density Firmness (>0.3 mm section) Mud content (less than 0.075 mm content) Angularity (flow time) Sand equivalent | g/cm<sup>3</sup>%%%s | 2.793140.574674 | ≥2.5≥12≤3≥30≥60 |
| Filler | Apparent density Moisture content Hydrophilic coefficient Plastic Index | g/cm<sup>3</sup>%/% | 2.7160.40.752.8 | ≥2.5≤1≤1≤4 |

## 2.2. Mixture DesignIn this stud

In this study, five asphalt mixtures were designed, including three kinds of highdulus asphalt mixture and two kinds of control mixture. Mixture A is a hard modulus asphalt mixture and two kinds of control mixture. Mixture A is a hard asphaltHMAM with a gradation type EME-14. Mixture A was designed by French EME met HMAM with a gradation type EME-14. Mixture A was designed by French EME method [1],and the optimum amount of asphalt for the mixture was determined using an abu and the optimum amount of asphalt for the mixture was determined using an abundancefactor K. Mixture B was a high-modulus asphalt mixture with HM1 additive an factor K. Mixture B was a high-modulus asphalt mixture with HM1 additive and SBS-modified asphalt, which was designed using the Superpave method [42]. The desi modified asphalt, which was designed using the Superpave method [42]. The designdation t e a SUP-20, and the do a e of the modifier u ed in Mixture B a oun gradation type was SUP-20, and the dosage of the modifier used in Mixture B accounted for 0.4% of the mass of the mixture. Mixtures C, D, and E were designed using Marshall method. HM2 additive and SBS-modified asphalt were used in Mixture C. The gradation type used for Mixture C was AC-20. The asphalt/aggregate ratio for Mixture C was determined by. the Marshall test method. Mixtures D and E are the control groups, SBS-modified AC-20mined by the Marshall test method. Mixtures D and E are the control groups, SBS and SBS-modified SMA-13, respectively. The synthetic gradation of the five mixtures isfied AC-20 and SBS-modified SMA-13, respectively. The synthetic gradation of t shown in Figure 1, and the design results are shown in Table 5.mixtures is shown in Figure 1, and the design results are s

![](images/page_4_chart_4.jpg)

![](images/page_4_chart_5.jpg)

![](images/page_4_chart_6.jpg)

Figure 1.Figure 1. Gradation of five mixtures.Gradation of five mixtur

![](images/page_4_chart_8.jpg)

Table 5. The designations of five mixtures.

| Mixture Type | Binder Type | Modifier Type | Dosage of Additives (%) | Optimum Asphalt Content (%) |
| --- | --- | --- | --- | --- |
| A | Hard asphalt | / | / | 5.4 |
| B | Base asphalt | HM1 | 0.4 | 4.2 |
| C | SBS-modified asphalt | HM2 | 0.35 | 5.4 |
| D | SBS-modified asphalt | / | / | 4.2 |
| E | SBS-modified asphalt | / | / | 6.0 |

Note: Additive content is the ratio of anti-rutting agent mass to mixture mass.

## 2.3. Testing Methods

## 2.3.1. Dynamic Modulus Test

In this paper, the dynamic modulus index is utilized to characterize the viscoelastic deformation behavior of different asphalt mixtures. Dynamic modulus tests on asphalt mixtures were carried out using the Simple Performance Tester (SPT). The specimens were prepared by rotary compaction forming 150 mm $\times 1 7 0$ mm cylindrical specimens and then drilling 100 mm $\times 1 5 0$ mm core samples with a coring machine to minimize test errors during the forming process. Referring to the requirements of the AASHTO $T - 7 9 ,$ the specimens are loaded in a stress-controlled mode. A set of 4 specimens was tested at $5   ^ { \circ } \mathsf { C } ,$ ${ \bar { 2 0 }   ^ { \circ } C } , 3 5   ^ { \circ } C ,$ and $5 5 \; ^ { \circ } \mathrm { C } ,$ at 25 Hz, 10 Hz, 5 Hz, 1 Hz, and 0.1 Hz, with 0 perimeter pressure selected for each of the five mixtures. The dynamic modulus $\left\| E ^ { * } \right\|$ and its viscoelastic component were calculated by Equations (1)–(3) [20].

$$
\left| E ^ { * } \right| = \sqrt { \left( E ^ { ' } \right) ^ { 2 } + \left( E ^ { '' } \right) ^ { 2 } }\tag{1}
$$

$$
E ^ { ' } = \frac { \sigma _ { a m p } } { \varepsilon _ { a m p } } \cos \varphi\tag{2}
$$

$$
E^{''} = \frac{\sigma_{amp}}{\varepsilon_{amp}} \sin \varphi\tag{3}
$$

where $\left\| \boldsymbol { E } ^ { * } \right\|$ is the dynamic modulus; $E ^ { ' }$ is storage modulus, characterizing the elastic component of the dynamic modulus; $E ^ { \prime \prime }$ is loss modulus, characterizing the viscous component of the dynamic modulus; $\sigma _ { a m p }$ is the stress amplitude; $\varepsilon _ { a m p }$ is the strain amplitude; and $\varphi$ is the phase angle.

## 2.3.2. High-Temperature Rutting Test

The wheel track test was carried out to evaluate the rutting resistance of five mixtures. There were three replicate samples were tested for each mixture, and the dimensions of each sample were 300 mm × 300 mm $\times 5 0$ mm [41]. Dynamic stability (DS) was employed to feature the high-temperature stability of tested mixtures. DS is defined as the wheel loading cycles to cause 1 mm rutting depth on the testing specimen at 60 $^ { \circ } \mathsf { C }$ and is used to describe the high-temperature rutting stability of asphalt concretes; here, higher dynamic stability represents better rutting stability [41].

Besides the laboratory tests, three trial pavement sections, as shown in Figure 2, were also built on Ningyang Expressway to observe the rutting resistance of different highmodulus asphalt mixtures (including mixtures A, B, and $\bar { C }$ as described in Section 2.2). The basic performances of the trial pavement sections are shown in Table 6. It can be seen that all of the tested performances can meet the requirement of Chinese standard JTG D40-2017 [43].

Table 6. Coring results of the middle layer of testing roads.

<table><tbody><tr><td>Index Requirements</td><td>Core Sample Thickness (mm)≥56</td><td colspan="2">Compaction Degree Coefficient of Water Appearance (%) Permeability (mL/min) Uniformly dense and98 ≤120without segregation</td></tr><tr><td>Section 1</td><td>60</td><td>99.2</td><td>9.9</td></tr><tr><td>Section 2</td><td>62</td><td>99.4</td><td>115</td></tr><tr><td>Section 3</td><td>59</td><td>99.5</td><td>31.7</td></tr></tbody></table>

![](images/page_6_image_2.jpg)

Figure 2. Testing roads.Figure 2. Testing roads.

## 2.3.3. Finite Element Simulation2.3.3. Finite Element Simulation

In this section, the ABAQUS software was used to build 2D simulation models ofIn this section, the ABAQUS software was used to build 2D simulation models of normal pavement structures and high-modulus pavement structures to calculate the in-normal pavement structures and high-modulus pavement structures to calculate the internal stress–strain conditions and rutting depths of pavement structural layers underternal stress–strain conditions and rutting depths of pavement structural layers under continuously variable temperature conditions. The pavement structure combination iscontinuously variable temperature conditions. The pavement structure combination is shown in Figure 3a. The model dimensions are shown in Figure 3a. The model dimensions are $X \times Y = 3 . 7 5 \times 3 \mathrm { ~ m ~ }$ here the X-axis is in, where the X-axis is the direction of the pavement width and the Y-axis is in the direction of the pavementin the direction of the pavement width and the Y-axis is in the direction of the pavement depth. The cell type is CPE8R, and the results of the meshing are shown in Figure 3c. Thedepth. The cell type is CPE8R, and the results of the meshing are shown in Figure 3c. cells close to the load area are densely divided, and the cell sizes away from the load grad-The cells close to the load area are densely divided, and the cell sizes away from the load ually become larger. The basic assumptions of the simulation are as follows: (1) the asphaltgradually become larger. The basic assumptions of the simulation are as follows: (1) the mixture is viscoelastoplastic material, and the cement-stabilized gravel and soil base areasphalt mixture is viscoelastoplastic material, and the cement-stabilized gravel and soil ideal elastomers; (2) the properties of the layers are homogeneous and continuous, andbase are ideal elastomers; (2) the properties of the layers are homogeneous and continuous, the structural layers are completely continuous with each other; (3) the bottom of the pave-and the structural layers are completely continuous with each other; (3) the bottom of the ment structural layer is set as a vertical constraint, and its left and right directions are setpavement structural layer is set as a vertical constraint, and its left and right directions are as horizontal constraints. set as horizontal constraints.

The material model for the subgrade and base course is an elastic model. The material model for the asphalt layer is the Bailey–Norton creep model, as shown in Equation (4), and its feasibility for pavement rutting calculation has been confirmed by many studies [44–47]. The Young’s modulus and Poisson’s ratio were used to characterize the elasticity of the material, and the creep parameters A, m, and n were used to characterize the creep characteristics of the material. More details on the creep model can be found in reference [48]. The values of all the material model parameters are shown in Tables 7 and 8.

$$
\varepsilon _ { \mathrm { c r } } = A q ^ { n } t ^ { m }\tag{4}
$$

where $\varepsilon _ { \mathbf { c r } }$ is the creep strain rate; $q$ is the equivalent force; t is the load action time; and $\mathbf { A } , \mathbf { n } ,$ and m are the creep parameters, which can be determined by indoor creep tests as described in [44].

![](images/page_7_image_2.jpg)

Figure 3. Pavement structural and finite element model. (a) Two pavement structures; (b) structureFigure 3. Pavement structural and finite element model. (a) Two pavement structures; (b) structure and load parameters; (c) finite element model mash.and load parameters; (c) finite element model mash.

The material model for the subgrade and base cTable 7. Elastic and creep parameters of asphalt mixtures.

<table><tr><td rowspan="2">Mixture Types</td><td rowspan="2">Temperature (°C)</td><td colspan="2">Elastic Parameter</td><td colspan="3">Creep Parameter</td></tr><tr><td>Elastic Modulus (MPa)</td><td>Poisson Ratio</td><td>A</td><td>n</td><td>m</td></tr><tr><td rowspan="5">SMA-13</td><td>20</td><td>886</td><td>0.25</td><td> $6 . 1 8 \times 1 0 ^ { - 1 1 }$ </td><td>0.89015</td><td>-0.5624</td></tr><tr><td>30</td><td>648</td><td>0.30</td><td> $3 . 1 6 \times 1 0 ^ { - 9 }$ </td><td>0.8189</td><td>-0.55765</td></tr><tr><td>40</td><td>584</td><td>0.35</td><td> $1 . 3 8 \times 1 0 ^ { - 8 }$ </td><td>0.7524</td><td>-0.54815</td></tr><tr><td>50</td><td>560</td><td>0.40</td><td> $1 . 3 2 \times 1 0 ^ { - 6 }$ </td><td>0.3933</td><td>-0.49875</td></tr><tr><td>60</td><td>536</td><td>0.45</td><td> $1 . 3 9 \times 1 0 ^ { - 5 }$ </td><td>0.3192</td><td>-0.4769</td></tr><tr><td rowspan="5">AC-20</td><td>20</td><td>955</td><td>0.25</td><td> $4 . 5 8 \times 1 0 ^ { - 1 1 }$ </td><td>0.945</td><td>-0.594</td></tr><tr><td>30</td><td>776</td><td>0.30</td><td> $2 . 4 6 \times 1 0 ^ { - 9 }$ </td><td>0.798</td><td>-0.587</td></tr><tr><td>40</td><td>655</td><td>0.35</td><td> $3 . 6 8 \times 1 0 ^ { - 8 }$ </td><td>0.775</td><td>-0.572</td></tr><tr><td>50</td><td>462</td><td>0.40</td><td> $4 . 8 1 \times 1 0 ^ { - 6 }$ </td><td>0.589</td><td>-0.53</td></tr><tr><td>60</td><td>394</td><td>0.45</td><td> $7 . 7 8 \times 1 0 ^ { - 5 }$ </td><td>0.382</td><td>-0.439</td></tr><tr><td rowspan="5">Mixture A</td><td>20</td><td>1945</td><td>0.25</td><td> $1 . 4 6 \times 1 0 ^ { - 1 2 }$ </td><td>0.962</td><td>-0.601</td></tr><tr><td>30</td><td>1491</td><td>0.30</td><td> $5 . 8 0 \times 1 0 ^ { - 1 0 }$ </td><td>0.896</td><td>-0.599</td></tr><tr><td>40</td><td>1187</td><td>0.35</td><td> $5 . 8 5 \times 1 0 ^ { - 9 }$ </td><td>0.823</td><td>-0.598</td></tr><tr><td>50</td><td>870</td><td>0.40</td><td> $6 . 1 0 \times 1 0 ^ { - 7 }$ </td><td>0.415</td><td>-0.532</td></tr><tr><td>60</td><td>693</td><td>0.45</td><td> $6 . 5 0 \times 1 0 ^ { - 6 }$ </td><td>0.35</td><td>-0.522</td></tr><tr><td rowspan="5">Sup-25</td><td>20</td><td>1070</td><td>0.25</td><td> $4 . 2 7 \times 1 0 ^ { - 1 1 }$ </td><td>0.85746</td><td>-0.54033</td></tr><tr><td>30</td><td>921</td><td>0.30</td><td> $3 . 2 2 \times 1 0 ^ { - 9 }$ </td><td>0.79887</td><td>-0.53568</td></tr><tr><td>40</td><td>754</td><td>0.35</td><td> $1 . 8 2 \times 1 0 ^ { - 8 }$ </td><td>0.7719</td><td>-0.52266</td></tr><tr><td>50</td><td>555</td><td>0.40</td><td> $1 . 1 2 \times 1 0 ^ { - 6 }$ </td><td>0.29946</td><td>-0.48546</td></tr><tr><td>60</td><td>409</td><td>0.45</td><td> $3 . 4 9 \times 1 0 ^ { - 5 }$ </td><td>0.1953</td><td>-0.38874</td></tr></table>

20 955 0.25 4.58 Table 8. Elastic parameters of base course and subgrade.

| Materials | Modulus of Resilience (MPa) | Poisson Ratio (%) |
| --- | --- | --- |
| Cement stabilized macadam | 1400 | 0.2 |
| Lime-fly ash stabilized soil | 300 | 0.3 |
| Subgrade soil | 50 | 0.4 |

Pavement temperatures are constantly changing throughout the day. Asphalt mixtures are typically viscoelastic materials, and their material properties are significantly influenced by temperature. To calculate the rutting deformation of the pavement under a continuous variable temperature service environment, the 24 h representative temperature of the’ high-temperature season in Xi’an was investigated, as shown in Table 9. Based on this, two pavement temperature field models were developed, the specific steps of which can be found in [46], and the pavement temperature field clouds for partial moments are shown in Figure 4. This temperature field model was used to calculate the rutting depth of thei d h f h   l d i l i bl pavement structure layer under continuously variable temperature conditions.diti

Table 9. The 24 h representative temperature results of the high-temperature season in Xi’an.’

| TimTiem (eh()h) 1 | 1 <sub>2</sub> | 2 <sub>3</sub> | 3 <sub>4</sub> | 4 5 5 6 6 7 7 8 8 |
| --- | --- | --- | --- | --- |
| TemTepmepraetruartuer (e°C(◦)C) 22.6 | 22 2.26.2 | 22 2.22.0 | 22. 201.7 | 21.7 21.5 21.5 22.1 22.1 23.5 23.5 25.3 25.3 |
| TimTiem (eh)(h) 9 | 9 10 | 10 11 | 11 12 | 12 13 13 14 14 15 15 16 16 |
| TemTepmepraetruartuer (e°C(◦)C) 27.9 | 27 3.09.1 | 30 <sub>3</sub>.1<sub>3</sub>.2 | 33. <sub>3</sub>2<sub>4</sub>.5 | 34.5 36.4 36.4 36.7 36.7 36.1 36.1 35.5 35.5 |
| Time (h) | 17 | 18 | 19 | 20 21 22 23 24 |
| TemTep Tmeimpraeetrua (rthue)r (e°C(◦)C) 3 147.1 | 34 <sub>3</sub>. <sup>1</sup><sub>2</sub>1<sup>8</sup>.2 | 32 <sub>2</sub>.2 <sup>1</sup><sub>9</sub><sup>9</sup>.5 | 29. <sub>2</sub>5 <sup>2</sup><sub>7</sub><sup>0</sup>.6 | 27.6 2 251.1 25.1 2 232.9 23.9 2 233.4 23.4 2 224.9 22.9 |

(a)

![](images/page_8_image_6.jpg)

(b)

![](images/page_8_image_8.jpg)

Figure 4. Road temperature clouds at 01:00 and 13:00: (a) 01:00 and (b) 13:00. Figure 4. Road temperature clouds at 01:00 and 13:00: (a) 01:00 and (b) 13:00.

Th d l  l d d ith  t d d l l d f 100 kN f  i l - l t i -The model was loaded with a standard axle load of 100 kN for a single-axle twinwheel set (shown in Figure 3b). The rutting deformation was calculated for 100,000, wheel set (shown in Figure 3b). The rutting deformation was calculated for 100,000, 300,000, 300,000, 500,000, 300,000 and 900,000 loadings, respectively, and the corresponding cumu-500,000, 300,000 and 900,000 loadings, respectively, and the corresponding cumulative lative loading time can be calculated according to Equation (5). Based on the measured 24 loading time can be calculated according to Equation (5). Based on the measured 24 h traffic h traffic volume proportion, the obtained cumulative loading times under different load-volume proportion, the obtained cumulative loading times under different loading times ing times were divided into different time periods, and the segmented cumulative action were divided into different time periods, and the segmented cumulative action time for time for each hour was obtained, as shown in Taeach hour was obtained, as shown in Table 10.

$$
t = \frac { 0 . 3 6 N P } { n _ { w } p B v }\tag{5}
$$

where t is the cumulative wheel load time; N is load times; P is the axle load, taken as 100 kN; $n _ { w }$ is the wheel numbers, taken as 4; p is the tire ground pressure distribution, taken as 0.707 MPa; B is the tire contact width, taken as 21.3 mm; and v is the speed, taken as 100 km/h.

Table 10. The traffic volume percentage for each hour per day and the segmented cumulative loading time (100,000 loading times).

| Time (h) | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Proportion of traffic volume (%) | 0.924 | 0.739 | 0.665 | 0.370 | 0.529 | 0.739 | 1.535 | 2.048 |
| Load time | 5.581 | 4.465 | 4.018 | 2.232 | 3.194 | 4.465 | 9.270 | 12.369 |
| Proportion of traffic volume (%) | 3.587 | 4.565 | 5.674 | 7.652 | 8.022 | 8.913 | 8.652 | 7.761 |
| Load time (s) | 21.665 | 27.574 | 34.270 | 46.219 | 48.451 | 53.835 | 52.259 | 46.876 |
| Time (h) | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 |
| Proportion of traffic volume (%) | 8.130 | 7.322 | 6.283 | 4.435 | 3.695 | 3.326 | 2.587 | 1.848 |
| Load time (s) | 49.108 | 44.223 | 37.947 | 26.786 | 22.321 | 20.089 | 15.625 | 11.161 |

Note: Only the segmented cumulative action time for 100,000 loads is shown here, the calculation is the same for the other loads.

## 3. Results and Discussions

In this section, the variation of the dynamic modulus of the five mixes and their viscoelastic components with loading frequency and temperature are firstly analyzed. Further, the correlation between different modulus indicators and the rutting resistance of HMAM was explored from the perspectives of both mixture and pavement structure, and two indicators were proposed to characterize the rutting resistance of HMAM. Based on these two indicators, the rutting resistance mechanisms of different materials (hard asphalt, PE additives, dissolved polyolefins) are discussed, where high-modulus agents are more effective than hard asphalt in improving the rutting resistance of HMAM.

## 3.1. Dynamic Modulus Properties

## 3.1.1. Effect of Temperature and Frequency on Dynamic Modulus

Figures 5 and 6 show the variation of dynamic modulus with loading frequency and temperature for the five mixture types, respectively. As can be seen from these figures, the dynamic modulus of all five asphalt mixtures increases with frequency at all temperatures. This is attributed to the fact that asphalt mixtures are viscoelastic materials, and there is a certain hysteresis in their deformation under external loading stresses, and the accumulation of energy increases gradually with the increase in loading frequency, which in turn leads to an increase in dynamic modulus. It can be further found that the increase in dynamic modulus tends to decrease with increasing loading frequency at the same temperature, which is due to the insignificant viscous properties of the asphalt mixture under high-frequency loading. At the same loading frequency, the dynamic modulus of the asphalt mixture gradually decreases with increasing temperature. The reason for this is that the increase in temperature decreases the viscosity of the asphalt, leading to a weakening of the ability to resist deformation and a corresponding decrease in the dynamic modulus, and the decay of the dynamic modulus of the asphalt mixture also decreases with increasing temperature. Moreover, the variation of dynamic modulus with frequency and temperature has a relatively constant trend for different asphalt mixtures.

## 3.1.2. Comparative Analysis of the Viscoelastic Component of Dynamic Modulus

The elastic and viscous components of the dynamic modulus of the five mixtures were calculated from the dynamic modulus and the phase angle data obtained in the dynamic modulus experiments. The trend of the elastic and viscous components of the dynamic modulus as a function of temperature and frequency is shown in Figures 7 and 8. It can be seen that the viscous component of the dynamic modulus is significantly larger than the elastic component, and the viscous component of all mixtures has a similar variation trend with temperature and frequency, with increasing temperature and decreasing frequency, the viscous component gradually decreases; nevertheless, the elastic component has a quite different variation trend in different temperature ranges: in the low-temperature range, the frequency variation has less effect on it, and when the temperature is higher than 35 ◦C, the elastic component increases with the increase in frequency. This may be caused by the different viscoelastic properties of the asphalt mixtures at different temperatures, resulting in a large variation in the phase angle of the mixture with the loading frequency at different temperatures.

To further analyze the trend of the modulus properties of asphalt mixtures in the highand low-temperature range, the ratio of the elastic and viscous components of the five mixtures was investigated and the results are shown in Figure 9. In the low-temperature interval, the ratio of elastic to viscous components was less than 0.4 and decreased with increasing frequency, with the same trend as the change in phase angle at low temperatures. In the high-temperature range, the ratio of elastic to viscous components of the four asphalt mixtures ranged from 0.25 to 0.7, there was no obvious pattern with the increase of frequency, and the trend was the same as the change of phase angle at high temperatures. In the high-temperature range, the trend towards the viscoelastic component of the dynamic modulus is various for various mixtures; thus, it is unreasonable to use either the dynamic modulus or the ratio of the viscoelastic components at a certain frequency to describe theIEW 11IEW 11 creep characteristics of asphalt mixtures, which provides a reference for the subsequent selection of a dynamic modulus-based rutting resistance evaluation index.

(a)

![](images/page_10_chart_4.jpg)

(b)

![](images/page_10_chart_6.jpg)

(c)

![](images/page_10_chart_8.jpg)

(d)

![](images/page_10_chart_10.jpg)

Frequency (Hz)

(e)

![](images/page_10_chart_13.jpg)

ure 5. Variation of dynamic modulus with loading frequency for the five asphalt mixtureFigure 5. Variation of dynamic modulus with loading frequency for the five asphalt mixture types ature 5. Variation of dynamic modulus with loading frequency for the five asphalt mixture emperatures ranging frotemperatures ranging fromp g g $5 \; ^ { \circ } \mathbf { C }$ C to $$5 5 \; ^ { \circ } \mathbf { C } .$$ C. (a) Mixture A; (b) Mixture B; (c) Mixture C; (d) M (a) Mixture A; (b) Mixture B; (c) Mixture C; (d) Mixture D;. ( )  ; ( )  ; ( )  ; (e) Mixture E(e) Mixture E.

(a)

![](images/page_10_chart_16.jpg)

Temperature (C)

(b)

![](images/page_10_chart_19.jpg)

Temperature (℃)

(c)

![](images/page_10_chart_22.jpg)

Temperature (C)

(d)

![](images/page_10_chart_25.jpg)

Temperature (°C)

(e)

![](images/page_10_chart_28.jpg)

Temperature (°C)

ure 6. Variation of dynamic modulus with temperatures for the five asphalt mixture tyure 6. Variation of dynamic modulus with temperatures for the five asphalt mixture tyFigure 6. Variation of dynamic modulus with temperatures for the five asphalt mixture types at ding frequency ranging from 0.1 Hz to 25 Hz. (a) Mixture A; (b) Mixture B; (c) Mixture ding frequency ranging from 0.1 Hz to 25 Hz. (a) Mixture A; (b) Mixture B; (c) Mixture loading frequency ranging from 0.1 Hz to 25 Hz. (a) Mixture A; (b) Mixture B; (c) Mixture C; t D; ( ) Mi t Exture D; (e) Mixture E. (d) Mixture D; (e) Mixture E.

## 3.2. Rutting Resistance

Figure 10 presents the results of the rutting tests at 60 $^ { \circ } \mathsf { C }$ for the five asphalt mixtures. The elastic and viscous components of the dynamic modulus of the five mixp   yIt can be observed that the dynamic stability values of the SBS-modified asphalt mixtures re calculated from the dynamic modulus and the phase angle data obtained in thre calculated from the dynamic modulus and the phase angle data obtained in thwith HM2 (Mixture C) were significantly greater than those of the hard asphalt HMAM mic modulus experiments. The trend of the elastic and viscous components of thmic modulus experiments. The trend of the elastic and viscous components of th(Mixture A), HMAM with HM1 (Mixture B), and the plain SBS-modified asphalt mixture i d l   f ti f t t d f i h i Fi 7 d 8mic modulus as a function of temperature and frequency is shown in Figures 7 and 8. (Mixture D), indicating their better rutting resistance. Furthermore, high-modulus agents h h   f h  l  fi l lseen that the viscous component of the dynamic modulus is significantly largerare effective in the improvement of the rutting resistance of the mixture, which is dependent l ti t, d th i t f ll i t h  i il ion the brand of the high-modulus agent. In addition, the rutting resistance of HMAM with high-modulus agents is better than that of HMAM with hard asphalt.

![](images/page_11_chart_2.jpg)

(a)

![](images/page_11_chart_4.jpg)

(b)

![](images/page_11_chart_6.jpg)

(c)

Temperature (C)

![](images/page_11_chart_9.jpg)

(d)

Temperature (C)

![](images/page_11_chart_12.jpg)

(e)

![](images/page_11_image_14.jpg)

igure 7. Viscous and elastic components of different mixtures. (a) Mixture A; (b) Mixture B; (Figure 7. Viscous and elastic components of different mixtures. (a) Mixture A; (b) Mixture B; ixture C; (d) Mixture D; (e) Mixture E. (c) Mixture C; (d) Mixture D; (e) Mixture E.

![](images/page_11_chart_16.jpg)

![](images/page_11_chart_17.jpg)

![](images/page_11_chart_18.jpg)

(a)

![](images/page_11_chart_20.jpg)

(d)

(c)

(b)

![](images/page_11_chart_24.jpg)

(e)

![](images/page_11_image_26.jpg)

Figure 8. Viscous and elastic components of different mixtures. (a) Mixture A; (b) Mixture B; (c) Mixture C; (d) Mixture D; (e) Mixture E.

(a)

![](images/page_12_chart_3.jpg)

(b)

![](images/page_12_chart_5.jpg)

Figure 9. Variation of the ratio of elastic to viscous components of different mixtures: (a) low-°temperature range $( 5 \; ^ { \circ } \mathsf { C } )$ and (b) high-temperature range $( 5 5 ~ ^ { \circ } \mathrm { C } )$

![](images/page_12_chart_7.jpg)

Figure 10. Figure 10. Dynamic stability of different asphalt mixtures.Dynamic stability of different asphalt mi

## 3.3. Correlation between Modulus and Rutting Resistance of Asphalt Mixture

According to the existing research results [49], the dynamic stability index is more reliable as an evaluation index of the high-temperature rutting resistance of the mixture; thus, the correlation between the dynamic modulus and the dynamic stability can be evaluated to study the correlation between the modulus and the rutting resistance of different mixtures. Figure 11 shows the correlation between the dynamic modulus and the dynamic stability of the five mixtures at different loading frequencies. It can be seen that there is no strong correlation between the dynamic modulus and dynamic stability at different frequencies under high-temperature conditions in terms of scatter plot data distribution. The modulus index for a particular frequency condition is not applicable to the evaluation of the rutting resistance of the mixture, again validating the conclusions of the analysis of the viscoelastic component of the asphalt mixtures.

![](images/page_13_chart_2.jpg)

Fi 11. C l ti b t d i t bilit d d iFigure 11. Correlation between dynamic stability and dynamic modulus $( 5 5 ~ ^ { \circ } \mathrm { C } )$ ° )  d ffat different loadf iing frequencies.

As the modulus index at a particular frequency condition can not reflect the creep As the modulus index at a particular frequency condition can not refleccharacteristics of the asphalt mixture, the correlation between the dynamic stability andure 11. Correlation between dynamic stability and dynamic modulus (55 °C) at different l characteristics of the asphalt mixture, the correlation between the dynamic stthe modulus ratio (dynamic modulus at low-frequency condition/dynamic modulus atquencies. the modulus ratio (dynamic modulus at low-frequenchigh-frequency condition) under high-temperature conditions $( 5 5 ~ ^ { \circ } \mathrm { C } )$ ition/dynamic  was attempted to hi h-f diti ) d hi h-t t diti (55 °Cbe investigated, and the results are shown in Figure 12. It can be found that the threeAs the modulus index at a particular frequency condition can not reflect the modulus ratios show a good correlation with the data of the dynamic stability. Moreover,racteristics of the asphalt mixture, the correlation between the dynamic stabilit the correlation coefficient increases as the frequency range (1 Hz\~10 Hz, 0.1 Hz\~10 Hz,d l  (d d l  l -f d /d d 0.1 $\mathrm { H z } { \sim } 2 5 ~ \mathrm { H z } ,$ . respectively) of the modulus ratio increases. This may be because the the correlation coefficient increases as the frequency range (1 Hz\~10 Hz, 0.1 Hzdynamic modulus of different asphalt mixtures has a relatively stable trend with frequency, Hz\~25 Hz, respectively) of the modulus ratio increases. This may be because thwhich results in a positive correlation between the dynamic modulus ratio and rutting atinvestigated, and the results are shown in Figure 12. It can be found that the modulus of differedifferent frequencies.dulus ratios show

lts in a positive correlation between the dynamic modulus ratio and ruttiThus, the above findings can be summarized as follows: (1) the ratio of low-frequencyelation coefficient increases as the frequency range (1 Hz\~10 Hz, 0.1 Hz\~10 fdynamic modulus to high-frequency dynamic modulus has a good correlation with the\~25 Hz, respectively) of the modulus ratio increases. This may be because the dy rutting dynamic stability under high-temperature conditions; (2) the wider the frequencydulus of different asphalt mixtures has a relatively stable trend with frequency, coverage, the higher the correlation between this ratio and rutting dynamic stability, and the 0.1 Hz dynamic modulus/25 Hz dynamic modulus ratio has the best correlation $( \dot { R ^ { 2 } } = 0 . 9 3 5 )$ with dynamic stability.

![](images/page_13_chart_6.jpg)

1Hz Dynamic Modulus/10Hz Dynamic Modulus

(b)

![](images/page_13_chart_9.jpg)

(c)

![](images/page_13_chart_11.jpg)

0.1Hz Dynamic Modulus/10Hz Dynamic Modulus 0.1Hz Dynamic Modulus/25Hz Dynamic Modulus

Figure 12. Correlation between dynamic modulus at high frequency/dynamic modulus at low frequency and dynamic stability. (a) 1 Hz dynamic modulus/10 Hz dynamic modulus; (b) 0.1 Hz dynamic modulus/10 Hz dynamic modulus; (c) 1 Hz dynamic modulus/25 Hz dynamic modulus.

## 3.4. Correlation between Modulus and Rutting Resistance of Pavement Structure

The modulus of the asphalt mixture has a significant effect on the structural forces of the pavement. The rutting deformation clouds for high-modulus pavement structures and normal pavement structures at different loading times are shown in Figure 13. It can be seen that the structural deformation of the pavement is mainly concentrated in the asphalt surface layer. The rutting in all cases is in the form of shear flow rutting, namely a concave deformation in the middle of the wheel load and a bulging deformation on the sides. Compared to normal pavement structures, the shear deformation of highmodulus pavement structures is significantly reduced at all loadings, and the increased modulus of the structural layer enhances the shear deformation resistance of the overall surface. Further, the rutting depth (maximum bulging deformation − maximum concave deformation) was calculated for both pavement structures, and the results are shown in Figure 14. The rutting depth of the high-modulus pavement structure is reduced by around 60% compared to the normal pavement structure, and the reduction in rutting depth is more stable at different loading times. Consequently, the use of high-modulus structural layers is an effective measure to significantly reduce the permanent deformation of asphalt surface layers.

## 3.5. Rutting Resistance Evaluation Based on Modulus Characteristics

The above analysis shows that, for a specific layer of asphalt mixture, reducing its frequency sensitivity under high-temperature conditions can improve the rutting resistance of that asphalt mixture, thus improving the rutting resistance of asphalt pavements; meanwhile, increasing the absolute value of the modulus of the structural layer can reduce the shear flow of asphalt surface layer, thus improving the rutting resistance of asphalt pavements. Therefore, it is advisable to evaluate the modulus performance of high-modulus asphalt mixtures by using both the absolute modulus value and the modulus ratio at high temperatures.

Figure 15 shows the values of the two indicators of the mixture. Based on these two indicators, the effects of raw materials (hard asphalt, PE additives, dissolved polyolefins) on anti-rutting performance were discussed.

It can be observed that the modulus value of HMAM with hard asphalt (Mixture A) was the highest, and it was significantly greater than that of several other mixtures. However, the dynamic modulus ratio and dynamic stability were not high, indicating that the hard asphalt does not improve the creep properties of the mixture significantly. The improved rutting resistance of the pavement structure is mainly achieved by the hard asphalt raising the modulus of the mixture and improving the stress of pavement structure.

The dynamic modulus ratio and dynamic stability index of HMAM with the addition of HM1 (Mixture B) are both higher. It is suggested that the PE additive can improve the modulus ratio and the absolute value of modulus in a comprehensive manner, which enables the structural stress and creep resistance of the mixture to be improved, and thus the rutting resistance of the asphalt pavement to be enhanced.

Under low-temperature conditions, the dynamic modulus of HMAM with HM2 (Mixture C) is the lowest; under high-temperature conditions, its dynamic modulus is only lower than that of additive rutting-resistant asphalt mixtures but significantly higher than SBS-modified asphalt SMA13 (Mixture E) and SBS-modified asphalt AC20 (Mixture D); in addition, the modulus ratio index and dynamic stability index of Mixture C are significantly higher than those of other asphalt mixtures. It illustrates that the composite modification of dissolved polyolefin and SBS is also a comprehensive improvement of the modulus ratio and the absolute value of the modulus to enhance the rutting resistance of asphalt pavements by improving the structural stress of the pavement and significantly improving the creep resistance characteristics of the mixture.

(a)

![](images/page_15_image_3.jpg)

(b)

![](images/page_15_image_5.jpg)

(g)

![](images/page_15_image_7.jpg)

![](images/page_15_image_8.jpg)

(c)

![](images/page_15_image_10.jpg)

(h)

![](images/page_15_image_12.jpg)

(d)

![](images/page_15_image_14.jpg)

(i)

![](images/page_15_image_16.jpg)

(e)

![](images/page_15_image_18.jpg)

(j)

![](images/page_15_image_20.jpg)

Figure 13. Rutting deformation clouds for different loading times. (a) Structure (1) under $1 0 ^ { 5 }$ loading times; (b) Structure (1) underb)  ( ) d $2 \times 1 0 ^ { 5 }$ loading times; (c) Structure (1) underd   5 l $3 \times 1 0 ^ { 5 }$ loadingd t t (1) d 4 × 105 ltimes; (d) Structure (1) underStructure (1) under 4 × 105 loa $4 \times 1 0 ^ { 5 }$ St t (1) d 5 × 105 lloading times; (e) Structure (1) underes; (e) Structure (1) under 5 × 105 load $5 \times 1 0 ^ { 5 }$ f) St tloading times;s; (f) Structure 2) under 105 loading t(f) Structure (2) under(2) under 105 loading t $1 0 ^ { 5 }$ s; (g) Structure (2) under 2 × 105 loaloading times; (g) Structure (2) unders; (g) Structure (2) under 2 × 105 loadi $2 \times 1 0 ^ { 5 }$ es; (h) Structure (2) under loading times; (h) Structure; (h) Structure (2) under 3 × 05 loadin(2) under 105 loadin $3 \times 1 0 ^ { 5 }$ (i) Structure (2) under 4 × 105 loadinloading times; (i) Structure (2) under (i) Structure (2) under 4 × 105 loading $4 \times 1 0 ^ { 5 }$ ; (j) Structure (2) under 5 × 105 loadiloading times; (j) Structure (2) under(j) Structure (2) under 5 × 10<sup>5</sup> loading $5 \times 1 0 ^ { 5 }$ loading times.

![](images/page_15_chart_22.jpg)

Figure 14. Rutting depth for two structures with different loading times.Figure 14. Rutting depth for two structures with different loading times.

![](images/page_16_chart_2.jpg)

gure 15. The values of two indicators of five mixturFigure 15. The values of two indicators of five mixtures.

## 3.6. Testing Road VerificationIn laboratory tests, ru

hi h , d i  i ifi l  h h f l h iIn laboratory tests, rutting dynamic stability is used to characterize the rutting resis-nce of the mixture. It should be noted that rutting in the field is influenced by multiple tance of the mixture. It should be noted that rutting in the field is influenced by multi-factors such as material properties, pavement structure, traffic loading, and climatic conple factors such as material properties, pavement structure, traffic loading, and climaticditions [50]. Therefore, we paved three testing sections using the HMAMs studied in this.conditions [50]. Therefore, we paved three testing sections using the HMAMs studied inpaper to correlate the field rutting data with the laboratory dynamic stability results, oved rutting resistance of the pavement structure is mainly achieved by the hard athis paper to correlate the field rutting data with the laboratory dynamic stability results,thereby further validating the findings in this paper. Figure 16 presents the average value ising the modulus of the mixture and improving the stress of pavement structurethereby further validating the findings in this paper. Figure 16 presents the average valueof the test results of the rutting depth on the road surface of the trial pavement sections The dynamic modulus ratio and dynamic stability index of HMAM with the adof the test results of the rutting depth on the road surface of the trial pavement sections andand the ordinary pavement sections after one year of construction. It can be seen that, HM1 (Mixture B) are both higher. It is suggested that the PE additive can improthe ordinary pavement sections after one year of construction. It can be seen that, comparedcompared with the ordinary pavement sections, the rutting depth of the three trial paveodulus ratio and the absolute value of modulus in a comprehensive manner, whiwith the ordinary pavement sections, the rutting depth of the three trial pavement sectionsment sections is significantly reduced. Test Section 3 with Mixture C showed the greatest l th t t l t d  i t f th i t t b i dis significantly reduced. Test Section 3 with Mixture C showed the greatest reduction inreduction in rutting depth at 38%, followed by test Section 2 with Mixture B at 28.7%, and rutting depth at 38%, followed by test Section 2 with Mixture B atfinally test Section 1 with Mixture A at 24.4%. Therefore, it is co $2 8 . 7 \% ,$ and finally test Sec-d that the anti-ruttion 1 with Mixture A at 24.4%. Therefore, it is concluded that the anti-rutting performanceting performance of three mixtures from high to low is C > B > A, which is consistent with of three mixtures from high to low isthe above indoor high-temperature $\mathsf { C } > \mathsf { B } > \mathsf { A }$ , which is consistent with the above indoorce test results and further verifies the ra-;  g - p ,  yhigh-temperature performance test results and further verifies the rationality of dynamictionality of dynamic modulus index to evaluate the anti-rutting performance of high-modnly lower than that of additive rutting-resistant asphalt mixtures but significantly hmodulus index to evaluate the anti-rutting performance of high-modulus asphalt mixtures.ulus asphalt mixtures.

![](images/page_16_chart_6.jpg)

Figure 16. Results of rutting depth measured in the testing road.

## 4. Conclusions

In this study, the dynamic modulus variation pattern of different types of HMAMs with temperature and load was investigated, and the relationship between different modulus indices and rutting resistance was explored. The results of laboratory tests were verified by the observations of three test sections. The main conclusions are summarized as follows.

(1) With the increase of loading frequency and testing temperature, the dynamic modulus of the mixtures showed a gradual increase and decrease, respectively, and the trend of dynamic modulus of different asphalt mixtures with temperature and frequency was relatively constant.

(2) The ratio of low-frequency dynamic modulus to high-frequency dynamic modulus under high-temperature conditions correlates well with dynamic stability, and the wider the frequency coverage, the higher the correlation between this ratio and dynamic stability. Moreover, the ratio of 0.1 Hz dynamic modulus to 25 Hz dynamic modulus at 55 ◦C is recommended as an index for HMAM rutting analysis.

(3) The reduction of the frequency sensitivity (modulus ratio) of the mixture under high temperature conditions and the increase in the absolute value of the modulus of the structural layer both can improve the rutting resistance of the pavement. Therefore, it is advisable to combine the absolute modulus value and the modulus ratio under high-temperature conditions to evaluate the rutting resistance of HMAMs.

(4) High-modulus agents are more effective than hard asphalt in improving the rutting resistance of HMAM. The hard asphalt does not improve the creep characteristics of the mixture significantly, but mainly improves the rutting resistance of the pavement by increasing the modulus of the mixtures. The two high-modulus agents (PE, dissolved polyolefin) improve the rutting resistance of pavements by increasing the modulus ratio and absolute modulus of the mixtures.

The modulus-based rutting resistance index of HMAMs is of great significance for the evaluation and prediction of pavement rutting performance based on the modulus and the improvement of pavement rutting resistance. It should be noted that the dynamic modulus factors and HMAM material types considered in this paper are limited, and a preliminary linear correlation analysis between HMAM modulus properties and rutting resistance was conducted. Therefore, more investigation is still warranted to further clarify the specific quantitative relationship between the modulus index and rutting performance, improve the evaluation accuracy by examining more influencing factors (void ratio, perimeter pressure, HMAM type), and eventually propose a design method for HMAMs based on performance indicators.

**Author Contributions:** G.H.: conceptualization, methodology, and writing—original draft preparation; H.Z.: software, validation, formal analysis, and investigation; Y.G.: resources, data curation; F.G. and D.W.: writing—review and editing; Y.L. and Y.H.: visualization; J.Z. and B.H.: supervision, project administration, and funding acquisition. All authors have read and agreed to the published version of the manuscript.

**Funding:** This work was supported by National Key R&D Program of China (No. 2021YFB2601005) National Key R&D Program of China (No. 2018YFE0103800), National Science Foundation of China (No. 5217081949), National Natural Science Foundation of China (No. 51978068), Inner Mongolia Transportation Research Project (No. NJ-2021-17), and the Fundamental Research Funds for the Central Universities, CHD (No. 300102212210). The authors gratefully acknowledge their financial support.

**Institutional Review Board Statement:** Not applicable.

**Informed Consent Statement:** Not applicable.

**Data Availability Statement:** Data are contained within the article.

**Conflicts of Interest:** The authors declare no conflict of interest.

## References

1. Chen, Y.; Wang, H.; Xu, S.; You, Z. High modulus asphalt concrete: A state-of-the-art review. Constr. Build. Mater. 2020, 237, 117653. [[CrossRef](https://doi.org/10.1016/j.conbuildmat.2019.117653)]

2. Ma, T.; Ding, X.; Zhang, D.; Huang, X.; Chen, J. Experimental study of recycled asphalt concrete modified by high-modulus agent. Constr. Build. Mater. 2016, 128, 128–135. [[CrossRef](https://doi.org/10.1016/j.conbuildmat.2016.10.078)]

3. Wang, W.; Duan, S.; Zhu, H. Research on Improving the Durability of Bridge Pavement Using a High-Modulus Asphalt Mixture. Materials 2021, 14, 1449. [[CrossRef](https://doi.org/10.3390/ma14061449)]

4. Wang, X.; Qiu, Y.-J.; Xue, S.-Y.; Yang, Y.; Zheng, Y. Study on durability of high-modulus asphalt mixture based on TLA and fibre composite modification technology. Int. J. Pavement Eng. 2018, 19, 930–936. [[CrossRef](https://doi.org/10.1080/10298436.2016.1224411)]

5. Ghassemirad, A.; Bala, N.; Hashemian, L.; Bayat, A. Application of asphaltenes in high modulus asphalt concrete. Constr. Build. Mater. 2021, 290, 123200. [[CrossRef](https://doi.org/10.1016/j.conbuildmat.2021.123200)]

6. Gao, J.; Yao, Y.Q.; Yang, J.G.; Song, L.; Xu, J.; He, L.; Tao, W.J. Migration behavior of reclaimed asphalt pavement mastic during hot mixing. J. Clean. Prod. 2022, 376, 134123. [[CrossRef](https://doi.org/10.1016/j.jclepro.2022.134123)]

7. Falchetto, A.C.; Moon, K.H.; Wang, D.; Riccardi, C.; Wistuba, M.P. Comparison of low-temperature fracture and strength properties of asphalt mixture obtained from IDT and SCB under different testing configurations. Road Mater. Pavement Des. 2018, 19, 591–604. [[CrossRef](https://doi.org/10.1080/14680629.2018.1418722)]

8. Buchler, S.; Falchetto, A.C.; Walther, A.; Riccardi, C.; Wang, D.; Wistuba, M.P. Wearing Course Mixtures Prepared with High Reclaimed Asphalt Pavement Content Modified by Rejuvenators. Transp. Res. Rec. 2018, 2672, 96–106. [[CrossRef](https://doi.org/10.1177/0361198118773193)]

9. Guo, X.; Zhang, C.; Cui, B.; Wang, D.; Tsai, J. Analysis of impact of transverse slope on hydroplaning risk level. Proc. Soc. Behav. Sci. 2013, 96, 2310–2319. [[CrossRef](https://doi.org/10.1016/j.sbspro.2013.08.260)]

10. Gao, J.; Yang, J.G.; Yu, D.; Jiang, Y.; Ruan, K.G.; Tao, W.J.; Sun, C.; Luo, L.H. Reducing the variability of multi-source reclaimed asphalt pavement materials: A practice in China. Constr. Build. Mater. 2021, 278, 122389. [[CrossRef](https://doi.org/10.1016/j.conbuildmat.2021.122389)]

11. Izaks, R.; Rathore, M.; Haritonovs, V.; Zaumanis, M. Performance properties of high modulus asphalt concrete containing high reclaimed asphalt content and polymer modified binder. Int. J. Pavement Eng. 2020, 23, 2255–2264. [[CrossRef](https://doi.org/10.1080/10298436.2020.1850721)]

12. Zhang, Y.N.; Sun, L.J. Assessing Mechanical Properties of Hard Asphalt Mixtures with Different Design Methods. J. Mater. Civ. Eng. 2021, 33, 04021102. [[CrossRef](https://doi.org/10.1061/%28ASCE%29MT.1943-5533.0003698)]

13. Khiavi, A.K.; Naseri, S. The effect of bitumen types on the performance of high-modulus asphalt mixtures. Pet. Sci. Technol. 2019, 37, 1223–1230. [[CrossRef](https://doi.org/10.1080/10916466.2018.1471494)]

14. Wang, C.; Wang, H.; Zhao, L.; Cao, D. Experimental study on rheological characteristics and performance of high modulus asphalt binder with different modifiers. Constr. Build. Mater. 2017, 155, 26–36. [[CrossRef](https://doi.org/10.1016/j.conbuildmat.2017.08.058)]

15. Zou, X.; Sha, A.; Jiang, W.; Huang, X. Modification mechanism of high modulus asphalt binders and mixtures performance evaluation. Constr. Build. Mater. 2015, 90, 53–58. [[CrossRef](https://doi.org/10.1016/j.conbuildmat.2015.04.048)]

16. Zou, X.; Sha, A.; Jiang, W.; Liu, Z. Effects of modifier content on high-modulus asphalt mixture and prediction of fatigue property using Weibull theory. Road Mater. Pavement Des. 2017, 18, 88–96. [[CrossRef](https://doi.org/10.1080/14680629.2017.1329864)]

17. Judycki, J.; Jaskula, P.; Dolzycki, B.; Pszczola, M.; Jaczewski, M.; Rys, D.; Stienss, M. Investigation of low-temperature cracking in newly constructed high-modulus asphalt concrete base course of a motorway pavement. Road Mater. Pavement Des. 2015, 16, 362–388. [[CrossRef](https://doi.org/10.1080/14680629.2015.1029674)]

18. Moghaddam, T.B.; Baaj, H. Rheological characterization of high-modulus asphalt mix with modified asphalt binders. Constr. Build. Mater. 2018, 193, 142–152. [[CrossRef](https://doi.org/10.1016/j.conbuildmat.2018.10.194)]

19. Rys, D.; Judycki, J.; Pszczola, M.; Jaczewski, M.; Mejlun, L. Comparison of low-temperature cracks intensity on pavements with high modulus asphalt concrete and conventional asphalt concrete bases. Constr. Build. Mater. 2017, 147, 478–487. [[CrossRef](https://doi.org/10.1016/j.conbuildmat.2017.04.179)]

20. Zhu, J.; Ma, T.; Cheng, H.; Li, T.; Fu, J. Mechanical Properties of High-Modulus Asphalt Concrete Containing Recycled Asphalt Pavement: A Parametric Study. J. Mater. Civ. Eng. 2021, 33, 04021056. [[CrossRef](https://doi.org/10.1061/%28ASCE%29MT.1943-5533.0003678)]

21. Yang, L.; Tao, L.; Zenglin, T.; Jianzhong, P.; Mingliang, Z.; Zhenguo, W. Research on self-healing behavior of asphalt modified by polyurea elastomer containing dynamic disulfide/diselenide bond. Eur. Polym. J. 2023, 189, 111990. [[CrossRef](https://doi.org/10.1016/j.eurpolymj.2023.111990)]

22. Cai, J.; Wen, Y.; Wang, D.; Li, R.; Zhang, J.P.; Pei, J.Z.; Xie, J. Investigation on the cohesion and adhesion behavior of high-viscosity asphalt binders by bonding tensile testing apparatus. Constr. Build. Mater. 2020, 261, 120011. [[CrossRef](https://doi.org/10.1016/j.conbuildmat.2020.120011)]

23. Huang, G.; Zhang, J.; Wang, Z.; Guo, F.; Li, Y.; Wang, L.; He, Y.; Xu, Z.; Huang, X. Evaluation of asphalt-aggregate adhesive property and its correlation with the interaction behavior. Constr. Build. Mater. 2023, 374, 130909. [[CrossRef](https://doi.org/10.1016/j.conbuildmat.2023.130909)]

24. Yan, J.; Leng, Z.; Ling, C.; Zhu, J.; Zhou, L. Characterization and comparison of high-modulus asphalt mixtures produced with different methods. Constr. Build. Mater. 2020, 237, 117594. [[CrossRef](https://doi.org/10.1016/j.conbuildmat.2019.117594)]

25. Zhu, J.Q.; Ma, T.; Fan, J.W.; Fang, Z.Y.; Chen, T.; Zhou, Y. Experimental study of high modulus asphalt mixture containing reclaimed asphalt pavement. J. Clean. Prod. 2020, 263, 121447. [[CrossRef](https://doi.org/10.1016/j.jclepro.2020.121447)]

26. Xiao, F.P.; Ma, D.H.; Wang, J.Y.; Cai, D.G.; Lou, L.W.; Yuan, J. Impacts of high modulus agent and anti-rutting agent on performances of airfield asphalt pavement. Constr. Build. Mater. 2019, 204, 1–9. [[CrossRef](https://doi.org/10.1016/j.conbuildmat.2019.01.138)]

27. Xiao, F.P.; Wang, J.Y.; Yuan, J.; Liu, Z.Y.; Ma, D.H. Fatigue and Rutting Performance of Airfield SBS-Modified Binders Containing High Modulus and Antirutting Additives. J. Mater. Civ. Eng. 2020, 32, 04019366. [[CrossRef](https://doi.org/10.1061/%28ASCE%29MT.1943-5533.0002985)]

28. Moghaddam, T.B.; Baaj, H. The use of compressible packing model and modified asphalt binders in high-modulus asphalt mix design. Road Mater. Pavement Des. 2020, 21, 1061–1077. [[CrossRef](https://doi.org/10.1080/14680629.2018.1536611)]

29. Wu, B.W.; Luo, C.F.; Pei, Z.H.; Chen, C.C.; Xia, J.; Xiao, P. Evaluation of the Aging of Styrene-Butadiene-Styrene Modified Asphalt Binder with Different Polymer Additives. Materials 2021, 14, 5715. [[CrossRef](https://doi.org/10.3390/ma14195715)]

30. Wu, B.W.; Luo, C.F.; Pei, Z.H.; Xia, J.; Chen, C.C.; Kang, A.H. Effect of Different Polymer Modifiers on the Long-Term Rutting and Cracking Resistance of Asphalt Mixtures. Materials 2021, 14, 3359. [[CrossRef](https://doi.org/10.3390/ma14123359)]

31. Xiong, H.; Han, J.F.; Wang, J.; Ren, Q.; Wu, L.B. Application of high viscosity-high modulus modified asphalt concrete in bus rapid transit station pavement—A case study in Chengdu, China. Case Stud. Constr. Mater. 2022, 17, e01337. [[CrossRef](https://doi.org/10.1016/j.cscm.2022.e01337)]

32. Fang, Y.; Zhang, Z.; Wang, S.; Yang, J.; Li, X. Determination of Minimum Dynamic Modulus (E\*) of High Modulus Asphalt Concrete Applied to Semirigid Base Asphalt Pavementm. J. Mater. Civ. Eng. 2022, 34, 04021378. [[CrossRef](https://doi.org/10.1061/%28ASCE%29MT.1943-5533.0004013)]

33. Zielinski, P. Effect of reclaimed asphalt shingles addition on asphalt concrete dynamic modulus master curves. Arch. Civ. Mech. Eng. 2021, 67, 109–122. [[CrossRef](https://doi.org/10.24425/ace.2021.138046)]

34. Ali, Y.; Irfan, M.; Ahmed, S.; Ahmed, S. Permanent deformation prediction of asphalt concrete mixtures–A synthesis to explore a rational approach. Constr. Build. Mater. 2017, 153, 588–597. [[CrossRef](https://doi.org/10.1016/j.conbuildmat.2017.07.105)]

35. Zhang, J.; Alvarez, A.E.; Lee, S.I.; Torres, A.; Walubita, L.F. Comparison of flow number, dynamic modulus, and repeated load tests for evaluation of HMA permanent deformation. Constr. Build. Mater. 2013, 44, 391–398. [[CrossRef](https://doi.org/10.1016/j.conbuildmat.2013.03.013)]

36. Apeagyei, A.K. Rutting as a Function of Dynamic Modulus and Gradation. J. Mater. Civ. Eng. 2011, 23, 1302–1310. [[CrossRef](https://doi.org/10.1061/%28ASCE%29MT.1943-5533.0000309)]

37. Walubita, L.F.; Fuentes, L.; Lee, S.I.; Dawd, I.; Mahmoud, E. Comparative evaluation of five HMA rutting-related laboratory test methods relative to field performance data: DM, FN, RLPD, SPST, and HWTT. Constr. Build. Mater. 2019, 215, 737–753. [[CrossRef](https://doi.org/10.1016/j.conbuildmat.2019.04.250)]

38. Mohammad, L.N.; Wu, Z.; Obulareddy, S.; Cooper, S.; Abadie, C. Permanent deformation analysis of hot-mix asphalt mixtures with simple performance tests and 2002 mechanistic-empirical pavement design software. In Proceedings of the 85th Annual Meeting of the Transportation-Research-Board, Washington, DC, USA, 22–26 January 2006; p. 133.

39. Dong, F.; Yu, X.; Liu, S.; Wei, J. Rheological behaviors and microstructure of SBS/CR composite modified hard asphalt. Constr. Build. Mater. 2016, 115, 285–293. [[CrossRef](https://doi.org/10.1016/j.conbuildmat.2016.04.057)]

40. JTG F40-2004; Standard Specification for Construction of Highway Asphalt Pavements. Ministry of Transport of the People’s Republic of China: Beijing, China, 2004.

41. JTG E20-2011; Standard Test Methods of Bitumen and Bituminous Mixtures for Highway Engineering. Ministry of Transport of the People’s Republic of China: Beijing, China, 2011.

42. Ziari, H.; Hajiloo, M. The effect of mix design method on performance of asphalt mixtures containing reclaimed asphalt pavement and recycling agents: Superpave versus balanced mix design. Case Stud. Constr. Mater. 2023, 18, e01931. [[CrossRef](https://doi.org/10.1016/j.cscm.2023.e01931)]

43. JTG D50-2017; Specifications for Design of Highway Asphalt Pavement. Ministry of Transport of the People’s Republic of China: Beijing, China, 2017.

44. Zheng, M.; Han, L.; Qiu, Z.; Li, H.; Ma, Q.; Che, F. Simulation of permanent deformation in high-modulus asphalt pavement using the Bailey-Norton creep law. J. Mater. Civ. Eng. 2016, 28, 04016020. [[CrossRef](https://doi.org/10.1061/%28ASCE%29MT.1943-5533.0001511)]

45. Luo, S.; Lu, Q.; Qian, Z.; Wang, H.; Huang, Y. Laboratory investigation and numerical simulation of the rutting performance of double-layer surfacing structure for steel bridge decks. Constr. Build. Mater. 2017, 144, 178–187. [[CrossRef](https://doi.org/10.1016/j.conbuildmat.2017.03.172)]

46. Yang, L.; Hu, Y.; Zhang, H. Comparative study on asphalt pavement rut based on analytical models and test data. Int. J. Pavement Eng. 2018, 21, 781–795. [[CrossRef](https://doi.org/10.1080/10298436.2018.1511781)]

47. Fang, H.; Haddock, J.E.; White, T.D.; Hand, A.J. On the characterization of flexible pavement rutting using creep model-based finite element analysis. Finite Elem. Anal. Des. 2004, 41, 49–73. [[CrossRef](https://doi.org/10.1016/j.finel.2004.03.002)]

48. Liao, G.; Huang, X. The Application of ABAQUS Finite Element Software in Road Engineering; Southeast University Press: Nanjing, China, 2014.

49. Zhang, M.L.; Zhang, J.P.; Guan, Y.S.; Zhang, H.F.; Huang, G.J.; Wang, Y.C. Evaluation of High-Temperature Performance Indexes of Anti-rutting Asphalt Mixture. J. Test Eval. 2022, 50, 2948–2966. [[CrossRef](https://doi.org/10.1520/JTE20210146)]

50. Guo, R.; Nian, T.; Zhou, F. Analysis of factors that influence anti-rutting performance of asphalt pavement. Constr. Build. Mater. 2020, 254, 119237. [[CrossRef](https://doi.org/10.1016/j.conbuildmat.2020.119237)]