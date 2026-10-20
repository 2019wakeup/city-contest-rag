<!--
SOURCE: 原始 PDF: reference/评估方法/Belhaj 等 - 2024 - Accuracy of Dynamic Modulus Models of Asphalt Mixtures Containing Reclaimed Asphalt (RA).pdf | 页数: 17 | 集合: reference
题录: litfull-096 Accuracy of Dynamic Modulus Models of Asphalt Mixtures Containing Reclaimed Asphalt (RA) (DOI: 10.3390/app142210505)
提取: MinerU markdown 全文（可重建索引的真相源副本；images/ 不入 corpus）
-->
ArticleAppl. Sc

# Accuracy of Dynamic Modulus Models of Asphalt Mixtures Containing Reclaimed Asphalt (RA)

**Majda Belhaj** <strong><sup>1</sup></strong>**,\* , Jan Valentin** <strong><sup>1</sup></strong> **and Nicola Baldo** <strong><sup>2</sup></strong>**,\***p g ,

1 Faculty of Civil Engineering, Czech Technical University in Prague, 166 29 Prague, Czech Republic;there are three main methods of prediction: empirical prediction equations (based jan.valentin@fsv.cvut.czssion analyses), m

2 Polytechnic Department of Engineering and Architecture (DPIA), University of Udine, 33100 Udine, Italyory), and numerical simulation (based on computer technology) [9]. \* Correspondence: majda.belhaj@fsv.cvut.cz (M.B.); nicola.baldo@uniud.it (N.B.)

**Abstract:** The dynamic modulus $( | E ^ { * } | )$ is a fundamental mechanical parameter for studying the performance of hot mix asphalt and simulating its viscoelastic behaviour under different loading and thermal conditions. It is a primary tool to replicate road surface behaviour under vehicle traffic loading and temperature variations. Though, laboratory testing to determine this parameter is| ∗| time-consuming and costly. Several predictive models have been developed to estimate the dynamic| ∗| modulus, ranging from rheological to empirical regression models. This research was dedicated tod d fi l d b l d l f   . H  l. [1 ] l studying two predictive models for determining the master curve of the dynamic modulus of hot mixd h l  f RA-bl d d h l b d d d d h W k asphalt used in a regular pavement binder course containing different reclaimed asphalt contentsd l’ bilit t ti t th d i d l t  f h lt i t (0%, 30%, 40%, and 50%). Laboratory experiments were conducted to assess their accuracy. Thet i i l i d h lt. Th l d d th t th Wit k d l i bl f di ti results show that Witczak’s sigmoid function provided the best accuracy for the master curves, while∗   f h  f . F ll , D  l. [11] d  h the Generalized Huet-Sayegh (2S2P1D) model showed less accurate predictions, particularly at thel i -b d l ith h  t t hi (SVM ), tifi i l l t range of low and high frequencies.works (ANNs), ensemble boost

**Keywords:** dynamic modulus; asphalt mixture; Witczak model; sigmoid function; 2S2P1D; generalizedh l . Th f d h h B d l h d d h b l f |𝐸∗| Huet-Sayegh model; prediction models; reclaimed asphalt; master curved  h h b - i d l i h

![](images/page_0_image_10.jpg)

**Citation:** Belhaj, M.; Valentin, J.; Baldo, N. Accuracy of Dynamic Modulus Models of Asphalt Mixtures Containing Reclaimed Asphalt (RA). Appl. Sci. **2024**, 14, 10505. [https://doi.org/10.3390/app142210505](https://doi.org/10.3390/app142210505)

Academic Editors: Joao Victor Staub De Melo and Luís Picado Santos

Received: 7 August 2024 Revised: 5 November 2024 Accepted: 7 November 2024 Published: 14 November 2024

![](images/page_0_image_14.jpg)

**Copyright:** © 2024 by the authors. Licensee MDPI, Basel, Switzerland. This article is an open access article distributed under the terms and conditions of the Creative Commons Attribution (CC BY) license ([https://creativecommons.org/licenses/by/](https://creativecommons.org/licenses/by/4.0/)4.0/).

## 1. Introduction

The dynamic modulusredicting the dynamic $( | E ^ { * } | )$ is a fundamental material property used to character-us of a conventional virgin asphalt mixture. These two ize the stiffness and elastic response of viscoelastic materials, such as hot mix asphaltempirical regression models are based on a sigmoidal function. The good prediction abil-(HMA) [1]. It is an essential parameter in the design and analysis of road pavementsity of these methods has led to their incorporation into the Mechanistic–Empirical Paveas it quantifies a material’s ability to resist deformation under dynamic (cyclic) loadingment Design Guide (MEPDG) for pavement design. conditions, commonly experienced by road surfaces due to vehicle traffic and temperature variations. The $\left\| E ^ { * } \right\|$ is typically determined through laboratory testing and is defined|𝐸∗| = (1) as the ratio of dynamic stress (σ) to dynamic strain (ε) experienced by a material under sinusoidal loading (see Figure 1) conditions at various temperatures [2]. Mathematically, itwhere σ represents the dynamic stress applied to the material and ε represents the dyis represented as in Equation (1).namic strain or deformation of t

![](images/page_0_image_19.jpg)

Figure 1. Sinusoidal stress (σ) and strain (ε) waveform in time (σ is the stress, $\sigma _ { 0 }$ is the amplitude of.the stress, ε is the strain, $\varepsilon _ { 0 }$ is the amplitude of the strain, $\omega$ , ଴ is the angular frequency of the oscillation, t is the time variable, and ϕ is the phase angle).

Under the noted conditions—sinusoidal loading at various temperatures—the asphalt mix behaves mainly in a linear viscoelastic manner, meaning that the material’s response to sinusoidal stress is sinusoidal, with a phase lag (Φ) between strain and stress (deformation and applied stress). Given this, the dynamic modulus $( | E ^ { * } | )$ is calculated. $\left| E ^ { * } \right|$ has a real partEW $( E _ { 1 } )$ and an imaginary part $( E _ { 2 } )$ , as shown in Figure 2, providing essential information3 of 18 about the elastic, viscous, and linear viscoelastic behaviour of an asphalt mixture over a wide range of temperatures and loading frequencies.

![](images/page_1_image_3.jpg)

Figure 2. Graphic representation of the dynamic modulus components including the phase angle Φ. Figure 2. Graphic representation of the dynamic modulus components including the phase angle Φ.

Various test methods exist to proceed with the calculation of this modulus, with loading type varying depending on the specific test protocol. The load can be applied either in compression (axial loading) in the case of an indirect tension dynamic test or in bending in the case of 2- and 4-point bending tests. In this research, the 4-point bending test (according to EN 12697-26 Annex B) was performed, the dynamic modulus was calculated, and the master curve was then generated [3]. However, dynamic tests, including the 4-point bending test, are known to be lengthy and costly. Therefore, many researchers, have explored methods for predicting the modulus, with a view to obtaining an order of p  [ – ].magnitude that can be used in pavement design [4–8]. Investigations have established y g  y     pthat there are three main methods of prediction: empirical prediction equations (based on regression analyses), meso-mechanical prediction methods (based on composite material theory), and numerical simulation (based on computer technology) [9].

.In the past few years, research focusing on predicting the dynamic modulus of asphalt mixtures containing RA has increased significantly. These studies utilize various techniques,.  g such as empirical, mechanistic, and machine learning-based, as well as hybrid models, to 2.1. Witczak Model: Sigmoid Function improve the accuracy of predictions of RA-based asphalt mixtures. To name a few, Wu Research conducted at the University of Maryland [17] demonstrated that the et al. [9] presented an n-layer-inclusions meso-mechanical model to predict the $\left\| E ^ { * } \right\|$ er of curve of asphalt can be represented by a sigmoid function. This method, esreclaimed asphalt materials. They recommended dividing asphalt layers into $\mathrm { N } = 5 0$ ed by  layers Pellinen and Witczak [17], involves constructing the master curve by adjustfor better prediction since the growth rate of reclaimed asphalt (predicted $\left| E ^ { * } \right| )$ he aram-decreased eters of the sigmoid function based on laboratosignificantly and became closer and closer after $\mathrm { N } = 5 0$ surements of the dynamic modulus . Hossain et al. [10] evaluated the vismeasured using a nonlinear regression method. coelastic properties of RA-blended asphalt binders and studied the Witczak model’s ability to estimate the dynamic modulus master curves of asphalt mixtures containing reclaimed 𝐿𝑜𝑔(|𝐸<sup>∗</sup>|ሻ = 𝛿 + , asphalt. They concluded that the Witczak model is capable of predicting $E ^ { * }$ (2) master curves of these types of mixtures. Finally, Dao et al. [11] used various machine learning-based |𝐸 | is the dynamic modulus (MPa); 𝛼, 𝛽, 𝛾, and 𝛿 are the regression parameters; algorithms such as support vector machines (SVMs), artificial neural networks (ANNs), and 𝑓௥ is the reduced frequency (Hz) defined by the following relation. ensemble boosted trees (Boosted), and Gaussian process regression (GPR) to predict the dynamic modulus of warm mix asphalt with different contents of reclaimed asphalt. They ௥      ௥found that the Boosted algorithm provided the best simulation of $\left| E ^ { * } \right|$ compared to the 𝑎 is the shift factor, 𝑓 is the teother above-mentioned algorithms.

d temperature (°C). The Witczak statistical model [5] and the Hirsch model [12] were among the first mod-This sigmoid model varies between 𝐿𝑜𝑔(|𝐸∗|ሻ (𝛿ሻ and 𝐿𝑜𝑔(|𝐸∗|ሻ (𝛿 + 𝛼ሻ of els used to evaluate the dynamic modulus and phase shift angle at specific temperatures the mix, based on two shape parameters (𝛽 , 𝛾), depending onand stresses, taking into account the characteristics of the mix.

t i d di t th i i l f ti –t t iti . I thiThe Witczak 1-37A [13] and Witczak 1-40D [5] models are the most popular models tion, the arameter 𝛾 influen e the lo e of the fun tion (the rate of ariation bet eenfor predicting the dynamic modulus of a conventional virgin asphalt mixture. These th i d th i i ), hil th t 𝛽 i fl th h i t l itwo empirical regression models are based on a sigmoidal function. The good prediction ability of these methods has led to their incorporation into the Mechanistic–Empirical Pavement Design Guide (MEPDG) for pavement design.

$$
| E ^ { * } | = \frac { \sigma } { \varepsilon }\tag{1}
$$

where $\sigma$ represents the dynamic stress applied to the material and ε represents the dynamic strain or deformation of the material.

Maxwell, Kelvin–Voigt, Di Benedetto–Neifer (2S2P1D), Huet–Sayegh, and Prony series present the linear viscoelastic behaviour of bituminous materials and model the dynamic modulus as a composition of springs and the elastic elements and linear dampers as the Newtonian viscous elements.

All the aforementioned models proved to have some limitations depending on the mixture properties and temperature level (especially at high and low temperatures). In this context, it is necessary to study the accuracy of some of these predictive models on different asphalt mixtures [14–16].

This research was therefore dedicated to studying the accuracy of some of the predictive models: Witczak and generalized Huet–Sayegh models to predict the master curve on asphalt mixtures (asphalt concrete—AC) containing different contents of reclaimed asphalt.

## 2. Theoretical Background: Predictive Models

## 2.1. Witczak Model: Sigmoid Function

Research conducted at the University of Maryland [17] demonstrated that the master curve of asphalt can be represented by a sigmoid function. This method, established by Pellinen and Witczak [17], involves constructing the master curve by adjusting the parameters of the sigmoid function based on laboratory measurements of the dynamic modulus measured using a nonlinear regression method.

$$
L o g \Big ( \Big | \boldsymbol { E } ^ { * } \Big | \Big ) = \delta + \frac { \alpha } { 1 + e ^ { \beta - \gamma L o g \left( f _ { r } \right) } } ,\tag{2}
$$

$\left| E ^ { * } \right|$ is the dynamic modulus (MPa); $\alpha , \; \beta ,$ $\gamma ,$ and $\delta$ are the regression parameters; and $f _ { r }$ is the reduced frequency (Hz) defined by the following relation.

$$
f _ { r } = a _ { T } \times f \Longleftrightarrow L o g \big ( f _ { r } \big ) = L o g \big ( a _ { T } \big ) + L o g \big ( f \big ) ,\tag{3}
$$

$a _ { T }$ is the shift factor, $f$ is the tested frequency at the temperature $T \left( \mathrm { H z } \right) _ { , }$ , and $T$ is the tested temperature $( ^ { \circ } \mathrm { C } )$

This sigmoid model varies between $L o g \big ( \big | E ^ { * } \big | \big ) _ { m i n }$ (δ) and $L o g \big ( \big | E ^ { * } \big | \big ) _ { m a x } \; \big ( \delta + \alpha \big )$ of the mix, based on two shape parameters $( \beta   ,   \gamma ) ,$ , depending on the reduced frequency $f _ { r } ,$ as determined according to the principle of time–temperature superposition. In this equation, the parameter $\gamma$ influences the slope of the function (the rate of variation between the maximum and the minimum), while the parameter $\beta$ influences the horizontal position of the point of rotation (Figure 3). In addition, the coefficients $\alpha$ and $\delta$ depend on the particle size composition of the mixture, the asphalt binder content, and the air void content. The coefficients $\beta$ and $\gamma$ depend on the properties of the binder and the magnitude of $\delta$ and $\alpha .$ The determination of these parameters is simply performed using the SOLVER function of Microsoft Excel 2016, which involves varying the parameter values in order to fit the measured data.

![](images/page_3_image_2.jpg)

igure 3. Parameterization of the sigmoid function [18]. Figure 3. Parameterization of the sigmoid function [18].

th d i ti i th lit t h l d fi th hift f t , h  th WilMany methods existing in the literature help define the shift factor, such as the, L d l–F (WLF) i , h A h i i , G li d Ti –TWilliams–Landel–Ferry (WLF) equation, the Arrhenius equation, Generalized,   , Time–Temperature Superposition (GTTS), and empirical or semi-empirical methods. Inp p ( ),  p  - p . the case of this study, graphic determination was used. The isotherms were translated,    . horizontally until they fit an adjacent isotherm relative to a fixed temperature (in this study,y         p (  y, °the reference temperature was set top     ), $2 0 \; ^ { \circ } \mathbf { C } ) _ { , }$ , based on the principle of time–temperaturep  – p p p . superposition. With this method, the translation factors were dependent on the adjustment,     p    . criteria.

## .  – y g 2.2. Generalized Huet–Sayegh Model (2S2P1D)The 2S2P1D model consists of two sprin

he 2S2P1D model consists of two springs, two parabolic elements, and one dashpot, The 2S2P1D model consists of two springs, two parabolic elements, and one dashpot,e the name. It is an adaptation of the Huet–Sayegh model, with an additional linear.    p   – y g , hence the name. It is an adaptation of the Huet–Sayegh model, with an additional lineardashpot placed in a series with the parabolic elements and the spring of rigidity (see Figp p      p    p g  g y ( gdashpot placed in a series with the parabolic elements and the spring of rigidity (seere 4). This model is suitable for characterizing the viscoelastic properties of asphalt mixre 4). This model is suitable for characterizing the viscoelastic properties of asphalt mix-Figure 4). This model is suitable for characterizing the viscoelastic properties of asphaltures and asphalt binders, which exhibit both elastic and viscous responses under dyres and asphalt binders, which exhibit both elastic and viscous responses under dy-mixtures and asphalt binders, which exhibit both elastic and viscous responses undernamic loading [19]. This simplified model can be used for analysis and design purposes amic loading [19]. This simplified model can be used for analysis and design purposes dynamic loading [19]. This simplified model can be used for analysis and design purposesn pavement engineering to predict a material’s behaviour under various loading condin pavement engineering to predict a material’s behaviour under various loading condi-in pavement engineering to predict a material’s behaviour under various loading conditions.ions.

![](images/page_3_image_7.jpg)

Figure 4. Generalized Huet–Sayegh rheological model (2S2P1D).

4. Generalized Huet–Sayegh rheological model (2S2P1D). The dynamic module of the Generalized Huet–Sayegh model is given by the following The dyexpression:

$$
E ^ { * } ( i \omega ) = E _ { 0 } + \frac { E _ { \infty } - E _ { 0 } } { 1 + \alpha \; { ( i \omega \tau ) } ^ { - k } + { ( i \omega \tau ) } ^ { - h } + { ( i \omega \tau \beta ) } ^ { - 1 } } ,\tag{4}
$$

𝐸∗(𝑖𝜔ሻ = 𝐸 + ஶ ଴, (4)  1 + 𝛼 (𝑖𝜔𝜏ሻ + (𝑖𝜔𝜏ሻ + (𝑖𝜔𝜏𝛽ሻThe model consists of nine parameters, from which six are expressed explicitly in the previous equation: $E _ { 0 }$ is the high-temperature stiffness; $E _ { \infty }$ is the purely elastic modulus;

$\alpha , ~ k ,$ and h are characteristics of the parabolic elements and set as $0 < k < h < 1 ;$ and $\beta$ is the Newtonian viscosity of the dashpot. As for the other three parameters, they are determined implicitly using τ, the time characteristic, and calculated as follows.

$$
L n ( \tau ) = a + b T + c T ^ { 2 } ,\tag{5}
$$

a, b, and c are regression constants representing the material characteristics.

The parameters of the 2S2P1D model were fitted by non-linear regression and successive approximations until a good visual fit was obtained between the curve given by the models and the experimental results. The method for determining these parameters involved minimizing the sum of the distances between the experimental dynamic modulus and that of the model, introduced at N points of pulsation ω<sub>i</sub> (Least Square Method). This minimisation was performed at the reference temperature $T _ { R } = 2 0 \; ^ { \circ } \mathrm { C }$ using the MS Excel SOLVER function as follows:

$$
M i n ( \sum _ { i = 1 } ^ { N } \Biggl ( \Bigl [ E _ { 1 } ^ { e x p } \bigl ( \omega _ { i } \bigr ) - E _ { 1 } ^ { m o d e l } \bigl ( \omega _ { i } \bigr ) \Bigl ] ^ { 2 } + \Bigl [ E _ { 2 } ^ { e x p } \bigl ( \omega _ { i } \bigr ) - E _ { 2 } ^ { m o d e l } \bigl ( \omega _ { i } \bigr ) \Bigl ] ^ { 2 } ) ,\tag{6}
$$

$E _ { 1 } ^ { e x p }$ and $E _ { 2 } ^ { e x p }$ 27 are, respectively, the real and imaginary parts of the experimental dynamic modulus $E ^ { * e x p }$ xp. Emodel1 and Emodel2 are, respectively, the real and imaginary parts of the dynamic modulus $E ^ { * m o d e l }$ given by the Generalized Huet–Sayegh model.

## 3. Experimental Materials and Testing

In this study, dynamic modulus tests were conducted on four asphalt mixtures with varying RA contents (0%, 30%, 40%, and 50%). The test data were used to determine the parameters of both models—sigmoid and Generalized Huet–Sayegh (2S2P1D)—and the accuracy of these models was evaluated.

The used asphalt mixtures were graded with a nominal maximum aggregate size of 16 mm, as shown in Figure 5, and were described as shown in Table 1. All mixtures had a targeted binder content of 4.5% by weight, distributed between binder reactivated from reclaimed asphalt and added virgin binder. The added asphalt binder was 50/70 paving-grade asphalt binder, which is the most commonly used asphalt binder in the Czech Republic (see Table 2).

Table 1. Basic used mixture’s characteristics.

|  | 0% | 30% | 40% | 50% | EN Standard |
| --- | --- | --- | --- | --- | --- |
| Bulk density [g.cm<sup>-3</sup>] | 2.392 | 2.368 | 2.400 | 2.390 | EN 12697-6 [20] |
| Maximum density [g.cm<sup>-3</sup>] | 2.538 | 2.520 | 2.524 | 2.553 | EN 12697-5 [21] |
| Voids content [%-vol.] | 5.7 | 6.0 | 4.9 | 6.4 |  |
| Moisture susceptibility, ITSR [%] | 94.0 | 77.4 | 71.4 | 79.6 | EN 12697-12 [22] |
| Stiffness @15 ◦C [MPa] | 7654 | 10,760 | 11,159 | 17,497 | EN 12697-26, annex C [3] |
| Fracture toughness [N/mm<sup>3/2</sup>] | 35 | 39 | 38 | 39 | EN 12697-44 [23] |
| Added virgin asphalt binder [% mass] | 0 | 2.7 | 2.0 | 1.6 |  |
| Total asphalt binders in the mix [% mass] | 4.5 | 4.5 | 4.5 | 4.5 |  |

Table 2. Asphalt binder 50/70 properties.

|  | 50/70 Asphalt Binder Properties | EN Standard |
| --- | --- | --- |
| Penetration @25 °C [0.1 mm] | 54 | EN 1426 [24] |
| Softening point (R&amp;B) [°C] | 50 | EN 1427 [25] |

![](images/page_5_chart_2.jpg)

Figure 5. Aggregate gradation of the asphalt mixture (red dots represent ACL aggregate gradation limits according to CSN 73 6121:2019 [ ˇ 26].

The reclaimed asphalt was collected from a cooperating asphalt mixing plant and its grading was characterized according to EN 13 108-1 [27] and CSN 73 6121 [26] standards (see Table 3). RA was then fractionated and stored in the laboratory in two fractions: fine/medium fraction $( 0 / 8$ mm) and coarse fraction $( 8 / 1 6$ mm) and characterized as follows:

Table 3. Basic used reclaimed asphalt characterization.

|  | Reclaimed Asphalt |
| --- | --- |
| Asphalt binder content | 5.7-5.9% |
| Asphalt binder properties | PEN 16 to 24 and softening point 65 to 72 ◦C |
| Grading | 0/8 mm |

A steel segment roller was used to compact a slab measuring 405 mm in length, 300 mm in width, and 50 mm, in accordance with EN 12697-33 [28]. This slab was then cut into 5 prismatic samples, each measuring 405 mm in length, 50 mm in width, and 50 mm in height.

The dynamic modulus test was conducted under a controlled strain with a fixed value of 50 micro-strains according to the European Standard EN 12697-26 at four temperatures, $0 \; ^ { \circ } \mathrm { C } ,   1 0 \; ^ { \circ } \mathrm { C } ,   2 0 \; ^ { \circ } \mathrm { C } ,$ and $3 0 ~ ^ { \circ } \mathbf { C } ,$ and at eleven selected frequencies, $5 0 \; \mathrm { H z } ,   3 0 \; \mathrm { H z } ,   2 0 \; \mathrm { H z } ,$ 15 Hz, 10 Hz, 8 Hz, 5 Hz, 3 Hz, 2 Hz, 1 Hz, and 0.1 $\mathrm { H z } ,$ for each temperature, using a Cooper research technology setup. During this test, the asphalt mixture sample was fixed at two endpoints, and sinusoidal loading was applied to two central points. The required force of deformation was measured as a function of time and phase lag. The dynamic modulus was then calculated:

$$
| E ^ { * } | = \sqrt { E _ { 1 } ^ { 2 } + E _ { 2 } ^ { 2 } } ,\tag{7}
$$

The phase angle was calculated as follows:

$$
\varPhi = \mathsf { t a n } ^ { - 1 } \bigg ( \frac { E _ { 2 } } { E _ { 1 } } \bigg ) ,\tag{8}
$$

## 4. Experimental Results: Master Curve Construction

From the tested data $( E _ { 1 }$ and $E _ { 2 } ) ,$ the dynamic modulus $\left( E ^ { * } \right)$ of each asphalt mixture was calculated and then plotted as a function of frequency for each temperature, T. These curves are called isothermal curves. Figure 6 shows the isothermal curves for all tested mixtures. For the mixture with 50% RA, the isothermal curve at $3 0   ^ { \circ } \mathbf { C }$ is missing due to inconsistencies in the dynamic values around that temperature compared to the former temperatures.

![](images/page_6_chart_3.jpg)

(a)

![](images/page_6_chart_5.jpg)

(b)

![](images/page_6_chart_7.jpg)

(c)

![](images/page_6_chart_9.jpg)

(d)

g .    p   ( ) % , ( ) % , ( ) % ,Figure 6. Isothermal curves of asphalt mixtures with (a) 0% RA, (b) 30% RA, (c) 40% RA, and (d) 50% RA.

Using the principle of time–temperature superposition, the isothermal curves werUsing the principle of time–temperature superposition, the isothermal curves were shifted to create a single smooth curve, referred to as the master curve. This curve provideshifted to create a single smooth curve, referred to as the master curve. This curve provides a clearer understanding of the deformation behaviour of asphalt mixtures across a broadea clearer understanding of the deformation behaviour of asphalt mixtures across a broader range of conditions. It also establishes a relationship between the dynamic modulus anrange of conditions. It also establishes a relationship between the dynamic modulus and reduced frequency on a log–log scale. The reduced frequereduced frequency on a log–log scale. The reduced frequency $( \omega _ { r } )$ (𝜔௥) was calculated as fol was calculated as follows:

$$
\omega _ { r } = \omega \times 1 0 ^ { \log a \left( T \right) } ,\tag{9}
$$

where $\omega _ { r }$ is the reduced frequency at a defined temperature (Hz), $\omega$ is the frequency (Hz), log $a ( T )$ is the shift factor, and T is the Temperature $( ^ { \circ } \mathrm { K } )$

As for the shift factor, it was defined as the amount of horizontal shifting required for each isothermal curve at each temperature to be shifted following the defined temperature called the reference temperature $T _ { R }$ . In this study, $T _ { R } = 2 0 ~ ^ { \circ } \mathsf { C } ~ [ 2 9 ]$ . These shifts were determined manually using Microsoft Excel, as shown in Table 4, and the master curvesature called the reference temperature ோ. In this study, ோ = 20 °C [29]. These shifts wer were plotted (see Figure 7).determined manually usin

Table 4. Shift factor determination for asphalt mixtures with different RA contents.

<table><tr><td></td><td colspan="2"> $\mathbf { 0 } ^ { \mathrm { ~ \circ ~ } } \mathbf { C }$ </td><td colspan="2"> $\mathbf { 1 0 } ^ { \mathrm { ~ \circ ~ } } \mathbf { C }$ </td><td colspan="2"> $\mathbf { 2 0 } \; ^ { \circ } \mathbf { C }$ </td><td colspan="2"> $\mathbf { 3 0 } ^ { \circ } \mathbf { C }$ </td></tr><tr><td>RA (%)</td><td>a(T)</td><td>log(a(T))</td><td>a(T)</td><td>log(a(T))</td><td>a(T)</td><td>log(a(T))</td><td>a(T)</td><td>log(a(T))</td></tr><tr><td>0</td><td>200</td><td>2.301</td><td>5</td><td>0.699</td><td>1</td><td>0</td><td>0.033</td><td>-1.481</td></tr><tr><td>30</td><td>980</td><td>2.991</td><td>30</td><td>1.477</td><td>1</td><td>0</td><td>0.038</td><td>-1.420</td></tr><tr><td>40</td><td>900</td><td>2.954</td><td>30</td><td>1.477</td><td>1</td><td>0</td><td>0.05</td><td>-1.301</td></tr><tr><td>50</td><td>1500</td><td>3.176</td><td>30</td><td>1.477</td><td>1</td><td>0</td><td>1</td><td></td></tr></table>

![](images/page_7_chart_5.jpg)

Figure 7. Master curves of asphalt mixtures with 0% RA, 30% RA, 40% RA, and 50% RA.

## 5. Parameter Acquisition

## 5. Parameter Acquisition 5.1. Time–Temperature Superposition

Time–Temperature Superposition In dynamic modulus prediction models, the concept of “time–temperature superposi-In dynamic modulus prediction models, the concept of “time–temperature superpotion” (referred to as “characteristic time”) is used to interpret the influence of temperature sition” (referred to as “characteristic time”) is used to interpret the influence of temperaon material properties and predict their behaviour at different loading rates. This concept ture on material properties and predict their behaviour at different loading rates. Thiis important for asphalt mixtures, as they exhibit significant viscoelastic behaviour and are concept is important for asphaltsensitive to temperature changes.

and are sensitive to temperature changes. The characteristic time (τ) is the time scale used to shift the isothermal curves in the The characteristic time (τ) is the time scale used to shift the isothermprevious sections and generate the master curve. It is calculated as follows:

$$
L n ( \tau ) = a + b T + c T ^ { 2 } ,\tag{10}
$$

$a , \; b ,$ and c are regression constants representing the material characteristics.

, , and  are regression constants representing the material characteristics. In this part, the resulting regression constants are presented for the tested asphalt mixtures in Table 5. It is shown that the values of $" \mathbf{a} "$ and $"  \mathbf{b}  "$ were close to each other for the different reclaimed asphalt mixtures, but the values of $" \mathbf{c}  "$ were different.

Table 5. Regression constants representing the material characteristics (polynomial second degree).

<table><tbody><tr><td rowspan="3">RA (%)</td><td colspan="4">Regression Parameters Representing the Material Characteristics</td></tr><tr><td colspan="4">(Polynomial Second Degree)</td></tr><tr><td>a</td><td>b</td><td>c</td><td>R²</td></tr><tr><td>0</td><td>2.217</td><td>-0.130</td><td>0.000301</td><td>0.98</td></tr><tr><td>30</td><td>2.992</td><td>-0.154</td><td>0.000235</td><td>1.00</td></tr><tr><td>40</td><td>2.963</td><td>-0.156</td><td>0.000440</td><td>1.00</td></tr><tr><td>50</td><td>3.176</td><td>-0.181</td><td>0.001109</td><td>1.00</td></tr></tbody></table>

## 5.2. Witczak Model: Sigmoid Function

To plot the master curve of the mixtures, the regression coefficients $\alpha , \beta , \gamma ,$ and δ of the sigmoid function (predefined in 0) were determined using the nonlinear regression method in Microsoft Excel’s SOLVER function. These regression coefficients are presented in Table 6 for each asphalt mix tested at the same reference temperature, $T _ { R } = 2 { \bar { 0   ^ { \circ } } } \mathrm { C } .$

Table 6. Regression parameters of the sigmoid function.

<table><tbody><tr><td rowspan="2">RA (%)</td><td colspan="4">Regression Parameters of the Sigmoid Function</td></tr><tr><td>δ</td><td>α</td><td>β</td><td>γ</td></tr><tr><td>0</td><td>2.373</td><td>2.032</td><td>-0.775</td><td>-0.361</td></tr><tr><td>30</td><td>2.447</td><td>2.087</td><td>-0.996</td><td>-0.451</td></tr><tr><td>40</td><td>0.004</td><td>4.451</td><td>-1.862</td><td>-0.473</td></tr><tr><td>50</td><td>1.353</td><td>3.149</td><td>-1.055</td><td>-0.373</td></tr></tbody></table>

These coefficients, $\alpha ,   \beta ,   \gamma ,$ and δ, were close for both asphalt mixtures with 0% RA and 30% RA, but they were different for the rest. The difference between these parameters could have been due to the fact that the addition of 30% RA and less has proven negligible influence on the mechanical properties of asphalt mixtures compared to higher reclaimed asphalt content mixtures.IEW

The master curves of |E<sup>∗</sup>| for the different asphalt mixtures tested are presented as a function of reduced frequency at the reference temperature of $2 0 \; ^ { \circ } \mathbf { C }$ in Figures 8–11.

0 % RA

![](images/page_8_chart_11.jpg)

Figure 8. Comparison between the master curves of the experimental data and those of the sigmoidFigure 8. Comparison between the master curves of the experimental data and those of the sigmoid pfunction of the asphalt mixture with 0% RA at $T _ { R } = 2 0 \; ^ { \circ } \mathsf { C } .$

![](images/page_9_chart_2.jpg)

Figure 9. Comparison between the master curves of the experimental data and those of the sigmoidg . p       p      g function of the asphalt mixture with 30% RA at $T _ { R } = 2 0 \; ^ { \circ } \mathsf { C } .$

![](images/page_9_chart_4.jpg)

g . p      p      gFigure 10. Comparison between the master curves of experimental data and those of the sigmoidFigure 10. Comparison between the master curves of experimental data and those of the sigmoid pfunction of the asphalt mixture with 40% RA at $T _ { R } = 2 0 \; ^ { \circ } \mathsf { C } .$

![](images/page_9_chart_6.jpg)

Figure 11. Comparison between the master curves of experimental data and those of the sigmoidFigure 11. Comparison between the master curves of experimental data and those of the sigmoid pfunction of the asphalt mixture with 50% RA at $T _ { R } = 2 0 \; ^ { \circ } \mathsf { C } .$

The evaluation of the master curves showed that the dynamic modulus estimated by the sigmoid function was almost identical to the actual measurement of the dynamic modulus determined in the laboratory. The worst fit was observed for the mixture with 0% reclaimed asphalt content, where the sigmoid model overestimated the dynamic modulus values across the entire range of frequencies and, thus, temperatures. Nevertheless, the sigmoidal model effectively captured the viscoelastic behaviour.f ti f th h lt i t ith 50% RA t T = 20 °Cg . p      p

Figures 12–15 show the calculated $\left| E ^ { * } \right|$ as a function of the measured $\left\| E ^ { * } \right\|$ of all the asphalt mixes tested. The figures demonstrate good accuracy and correlations between theFigures 12–15 show the calculated |𝐸 | as a function of the measured |𝐸 | of all the Figures 12–15 show the calculated |𝐸<sup>∗</sup>| as a function of the measured |𝐸<sup>∗</sup>| of all the measured and calculated dynamic moduli for all the tested mixtures, except for the virginasphalt mixes tested. The figures demonstrate good accuracy and correlations between asphalt mixes tested. The figures demonstrate good accuracy and correlations between mixture. Yet, the coefficient of determinationythe measured and calculated dynam $( \mathbb { R } ^ { 2 } )$ for all the mixtures was around 0.99. For, p duli for all the tested mixtures, except for the all the asphalt mixes, it can be observed that the points are almost perfectly aligned along aF ll h h l ,   b b d h h   l f lg . , straight line whereli d $\mathbf { y } = \mathbf { X } .$

![](images/page_10_chart_4.jpg)

Figure 12. Comparison between measured |E\*|\_exp and calculated |E\*|\_Sigmoid model for the Figure 12. Comparison between measured |E\*|\_exp and calculated |E\*|\_Sigmoid model for theFigure 12. Comparison between measured |E\*|\_exp and calculated |E\*|\_Sigmoid model for the asphalt mixture with 0% RA (the red line represents the identity funcasphalt mixture with 0% RA (the red line represents the identity functionasphalt mixture with 0% RA (the red line represents the identity func $\mathbf { y } = \mathbf { x } )$

![](images/page_10_chart_6.jpg)

Figure 13. Comparison between measured |E\*|\_exp and calculatedFigure 13. Comparison between measured |E\*|\_exp and calcula $| \mathbf { E } ^ { * } |$ \_Sigmoid model for the\*|\_Sigmoid model for the asphalt mixture with 30% RA (the red line represents the identity functionasphalt mixture with 30% RA (the red line represents the identity funct $\mathbf { y } = \mathbf { x } )$

![](images/page_10_chart_8.jpg)

Figure 14. Comparison between measured |E\*|\_exp and calculated |E\*|\_Sigmoid model for the Figure 14. Comparison between measured |E\*|\_exp and calculated |E\*|\_Sigmoid model for the asphalt mixture with 40% RA (the red line represents the identity function $\mathbf { y } = \mathbf { x } )$

![](images/page_11_chart_2.jpg)

Figure 15. Comparison betweeFigure 15. Comparison between measured $\left[ \mathbf { E } ^ { * } \right]$ sured |E\*|\_exp and c\_exp and calculated $| \mathbf { E } ^ { * } |$ ed |E\*|\_Sigmoid model f\_Sigmoid model for the asphalt mixture with 50% RA (the red line represents the identity asphalt mixture with 50% RA (the red line represents the identity function $\mathbf { y } = \mathbf { x } )$

## 5.3. Generalized Huet–Sayegh Model5.3. Generalized Huet–Sayegh Model (2S2P1D)

For the second model, the 2S2P1D model, the regression coeffiFor the second model, the 2S2P1D model, the regression coefficients $\alpha , \beta , \mathbf { k } ,$ β, k, aand h were determined to plot the master curve of the mixtures. These coefficients, predewere determined to plot the master curve of the mixtures. These coefficients, predefined as $0 ,$ , were obtained using the nonlinear regression method with the SOLVER function in,°Microsoft Excel. The coefficients for each asphalt mix are provided in Table 7, with the same reference temperature, $T _ { R } = 2 0 \; ^ { \circ } C$

Table 7. Generalized Huet–Sayegh model parameters.

<table><tr><td rowspan="2">RA (%)</td><td colspan="6">Generalized Huet-Sayegh Model Parameters</td></tr><tr><td> $\mathbf { E _ { 0 } }$ </td><td> $\mathbf { E _ { i n f } }$ </td><td>k</td><td>h</td><td>α</td><td>β</td></tr><tr><td>0</td><td>760</td><td>13,966</td><td>0.157</td><td>0.539</td><td>1.469</td><td>2,259,955</td></tr><tr><td>30</td><td>1154</td><td>27,717</td><td>0.215</td><td>0.749</td><td>2.728</td><td>2,259,953</td></tr><tr><td>40</td><td>214</td><td>26,105</td><td>0.242</td><td>0.725</td><td>3.559</td><td>2,259,961</td></tr><tr><td>50</td><td>16</td><td>23,935</td><td>0.195</td><td>0.670</td><td>4.644</td><td>2,259,953</td></tr></table>

Cole–Cole curves. The α parameter affected the height of the Cole–Cole curve anThe k parameter affected the left asymmetry of the Cole–Cole curve and the height of the Black space curve, while the h parameter affected the radius of the Black space and Cole–Cole curves. The α parameter affected the height of the Cole–Cole curve and the right asymmetry of the Black curve, and the $\beta$ typically represented the distribution of relaxation times in the material, describing the overall shape of the relaxation spectrum.

Additionally, the Cole–Cole diagram and Black space diagram helped to obtain the dynamic modulus limits, i.e., $\mathrm { E _ { 0 } }$ and $\mathrm { E _ { i n f } }$ . The Black space diagram is the result of plotting the dynamic modulus $\left[ \mathbf { E } ^ { * } \right]$ versus the phase angle Φ (Figure 16a). The Cole–Cole diagram (Figure 16b) illustrates the storage modulus $\mathrm { E } _ { 1 }$ and the loss modulus $\mathrm { E } _ { 2 }$ . These two diagrams are considered valuable tools since they evaluate the materials independently of the time–temperature superposition principle.

It is evident that all the mixtures shared almost the same value for the parameter β. It is also clear that the model parameters for the mixtures with 30% RA and 40% RA were close to each other, which could have been due to the slight difference in the reclaimed asphalt compared to the other mixtures.

The $\left\| E ^ { * } \right\|$ master curves for the tested asphalt mixes are presented as a function of frequency for the reference temperature of $2 0   ^ { \circ } \mathbf { C }$ in Figures 17–20.

![](images/page_12_chart_2.jpg)

![](images/page_12_image_3.jpg)

(b)

d (b) l k dFigure 16. Graphical representation of Huet–Sayegh model parameters in (a) Cole–Cole diagram andThis suggests that the 2S2P1D model did not represent the linear behaviour of asphal (b) Black diagram [30].mixes at low and hi

del paramete

![](images/page_12_chart_7.jpg)

Figure 17. Comparison between the master curves of the experimental data and those of the General-Figure 17. Comparison between the master curves of the experimental data and those of the Generized Huet–Sayegh (2S2P1D) model for asphalt mixture with 0% RA at alized Huet–Sayegh (2S2P1D) model for asphalt mixture with 0% RA $T _ { R } = 2 0 \; ^ { \circ } \mathsf { C } .$

![](images/page_12_chart_9.jpg)

Figure 18. Comparison between the master curves of the experimental data and those of the Gener-Figure 18. Comparison between the master curves of the experimental data and those of the Generaly g ( )   pized Huet–Sayegh (2S2P1D) model for asphalt mixture with 30% RA at $T _ { R } = 2 0 \; ^ { \circ } \mathrm { C }$

![](images/page_13_chart_2.jpg)

Figure 19. Comparison between the master curves of the experimental data and those of the Gener-Figure 19. Comparison between the master curves of the experimental data and those of the Generalized Huet–Sayegh (2S2P1D) model for asphalt mixture with 40% RA atalized Huet–Sayegh (2S2P1D) model for asphalt mixture with 40% R $T _ { R } = 2 0 \; ^ { \circ } \mathrm { C }$

![](images/page_13_chart_4.jpg)

Figure 20. Comparison between the master curves of the experimental data and those of the Generalized Huet–Sayegh (2S2P1D) model for asphalt mixture with 50% RA at $T _ { R } = 2 0 \; ^ { \circ } \mathsf { C } .$

The evaluation of the master curves showed that the dynamic modulus estimated by the Generalized Huet–Sayegh model differed from the actual laboratory measurements,. p       p       H –S h (2S2P1D) d l f h l i i h 50% RA  T  20 °C particularly in the range of low and high frequencies. However, these differences varied from one mixture to another.gures 21–24 show the calculated |𝐸

This suggests that the 2S2P1D model did not represent the linear behaviour of asphalts tested. mixes at low and high frequencies, and modifications to the model are required.d l d h d b h l d – h d l  l f

Figures 21–24 show the calculated |E<sup>∗</sup>| as a function of the measured |E<sup>∗</sup>| for all the the range of the high frequencies, the data fall below the line of the identity asphalt mixes tested.n. Yet, the difference is no

![](images/page_13_chart_9.jpg)

21. Comparison between measured |E\*|\_exp and calculated |E\*|\_2S2P1D model for the as-Figure 21. Comparison between measured |E\*|\_exp and calculated |E\*|\_2S2P1D model for the d li t th id tit f ti  =asphalt mixture with 0% RA (the green dotted line represents the trend line of the comparison data, and the red line represents the identity function y = x).

![](images/page_14_chart_2.jpg)

igure 22. Comparison between measured |E\*|\_exp and calculated |E\*|\_2S2P1D model for the as-Figure 22. Comparison between measured |E\*|\_exp and calculated |E\*|\_2S2P1D model for theW 16 of 18 W f 18 g   p      p ,asphalt mixture with 30% RA (the green dotted line represents the trend line of the comparison data, and the red line represents the identity function y = x).

![](images/page_14_chart_4.jpg)

igure 23. Comparison between measured |E\*|\_exp and calculated |E\*|\_2S2P1D model for the as-Figure 23. Comparison between measured |E\*|\_exp and calculated |E\*|\_2S2P1D model for theigur . ris t sur \* lculat \* l for t shalt mixture with 40% RA (the green dotted line represents the trend line of the comparison data, asphalt mixture with 40% RA (the green dotted line represents the trend line of the comparison data,lt mixture wit (t r line represents the tr li f t ris ta, nd the red line represents the identity function y = x). and the red line represents the identity function y = x). the red line represents the i tity f ti ).

![](images/page_14_chart_6.jpg)

i ure 24. Com arison between measured |E\*|\_ex and calculated |E\*|\_2S2P1D model for the as-i t \* l l t \* l f tFigure 24. Comparison between measured |E\*|\_exp and calculated |E\*|\_2S2P1D model for the halt mixture with 50% RA (the green dotted line represents the trend line of the comparison data, lt mixture wit (t r line represents the tr li f t ris ta, asphalt mixture with 50% RA (the green dotted line represents the trend line of the comparison data, nd the red line represents the identity function y = x).  the red line represents the i tity f ti ). and the red line represents the identity function y = x).

The figures demonstrate good accuracy and correlations between the experimental dynamic moduli and those estimated by the Generalized Huet–Sayegh model at low frequencies. At the range of the high frequencies, the data fall below the line of the identity function. Yet, the difference is not too high.

## 6. Conclusions

This study examined the accuracy of two different types of dynamic modulus master curve prediction models: the sigmoid function proposed by the Witczak model and the Generalized Huet–Sayegh model, also known as the 2S2P1D model. These models were applied to four asphalt mixtures with identical aggregate types but varying reclaimed asphalt contents (0% RA, 30% RA, 40% RA, and 50% RA), all of the same gradation and binder content.

It was proven that the sigmoid function is the most effective for characterizing the master curves of reclaimed mixtures. The comparison of the measured modulus vs. the calculated modulus along the identity function confirmed this conclusion. All the tested data achieved R² values close to 1, with almost perfect alignment along the line of best fit.

On the other hand, the 2S2P1D model showed a less accurate prediction of the dynamic master curves, especially at low and high frequencies. In these ranges, the model tended to underestimate the dynamic modulus of the reclaimed mixtures. Nevertheless, the overall fitting was quite good. Further optimization of the model is required.

**Author Contributions:** Conceptualization, M.B. and J.V.; methodology, M.B. and J.V.; investigation, M.B.; resources, J.V. and N.B.; data curation, M.B.; writing—original draft preparation, M.B.; writing—review and editing, J.V. and N.B.; visualization, M.B., J.V. and N.B.; supervision, J.V. and N.B.; project administration, J.V. and N.B. All authors have read and agreed to the published version of the manuscript.

**Funding:** This study was conceptualized and developed as part of activities related to the project GA22-04047K funded by the Czech Scientific Foundation (GACR).

**Institutional Review Board Statement:** Not applicable.

**Informed Consent Statement:** Not applicable.

**Data Availability Statement:** The data that support the findings of this study are available from the corresponding author upon reasonable request.

**Conflicts of Interest:** The authors declare no conflicts of interest.

## References

Pellinen, T.K. Investigation of the Use of Dynamic Modulus as an Indicator of Hot Mix Asphalt; Arizona State University: Tempe, AZ, USA, 2001.

2. Witzcak, M.W. Simple Performance Test for Superpave Mix Design; Transportation Research Board: Washington, DC, USA, 2002; Volume 465.

3. EN 12697-26; Bituminous Mixtures—Test Methods for Hot Mix Asphalt—Part 26: Stiffness. European Committee for Standardization: Brussels, Belgium, 2012.

4. Witczak, M.W.; Bari, J. Development of a Master Curve (E\*) Database for Lime Modified Asphaltic Mixtures; Arizona State University Research Report; Arizona State University: Tempe, AZ, USA, 2004.

5. Bari, J. Development of a New Revised Version of the Witczak E\* Predictive Models for Hot Mix Asphalt Mixtures. Ph.D. Dissertation, Arizona State University, Tempe, AZ, USA, 2005.

6. Shu, X.; Huang, B. Micromechanics-based dynamic modulus prediction of polymeric asphalt concrete mixtures. Compos. Part B Eng. 2008, 39, 704–713. [[CrossRef](https://doi.org/10.1016/j.compositesb.2007.05.003)]

7. Cho, Y.H.; Park, D.W.; Hwang, S.D. A predictive equation for dynamic modulus of asphalt mixtures used in Korea. Constr. Build. Mater. 2010, 24, 513–519. [[CrossRef](https://doi.org/10.1016/j.conbuildmat.2009.10.008)]

8. Zhu, H.; Sun, L.; Yang, J.; Chen, Z.; Gu, W. Developing master curves and predicting dynamic modulus of polymer-modified asphalt mixtures. J. Mater. Civ. Eng. 2011, 23, 131–137. [[CrossRef](https://doi.org/10.1061/%28ASCE%29MT.1943-5533.0000145)]

9. Wu, H.; Zhan, Y.; Song, W.; Xu, S.; Chen, X.; Liao, H. Prediction modelling on dynamic modulus of recycled asphalt mixtures based on meso-mechanical analysis. J. Clean. Prod. 2024, 469, 143200. [[CrossRef](https://doi.org/10.1016/j.jclepro.2024.143200)]

10. Hossain, Z.; Zaman, M. Prediction of Dynamic Modulus of Hot Mix Asphalts with Reclaimed Asphalt Pavement. Adv. Civ. Eng. 2020, 2020, 8672654. [[CrossRef](https://doi.org/10.1155/2020/8672654)]

11. Dao, D.V.; Nguyen, N.L.; Ly, H.B.; Pham, B.T.; Le, T.T. Cost-effective approaches based on machine learning to predict dynamic modulus of warm mix asphalt with high reclaimed asphalt pavement. Materials 2020, 13, 3272. [[CrossRef](https://doi.org/10.3390/ma13153272)] [[PubMed](https://www.ncbi.nlm.nih.gov/pubmed/32717910)]

12. Al-Khateeb, G.; Shenoy, A.; Gibson, N.; Harman, T. A new simplistic model for dynamic modulus predictions of asphalt paving mixtures. Assoc. Asph. Paving Technol. 2006, 75.

13. Witczak, M.W.; Fonseca, O.A. Revised predictive model for dynamic (complex) modulus of asphalt mixtures. Transp. Res. Rec. 1996, 1540, 15–23. [[CrossRef](https://doi.org/10.1177/0361198196154000103)]

14. Far, M.S.S. Development of New Dynamic Modulus (E\*) Predictive Models for Hot Mix Asphalt Mixtures; North Carolina State University ProQuest Dissertations Publishing: Raleigh, NC, USA, 2011.

15. Schwartz, C.W. Evaluation of the Witczak dynamic modulus prediction model. In Proceedings of the 84th Annual Meeting of the Transportation Research Board, Washington, DC, USA, 9–13 January 2005.

16. Ceylan, H.; Schwartz, C.W.; Kim, S.; Gopalakrishnan, K. Accuracy of predictive models for dynamic modulus of hot-mix asphalt. J. Mater. Civ. Eng. 2009, 21, 286–293. [[CrossRef](https://doi.org/10.1061/%28ASCE%290899-1561%282009%2921:6%28286%29)]

17. Garcia, G.; Thompson, M. HMA Dynamic Modulus Predictive Models (A Review); FHWA-ICT-07-005; Illinois Center for Transportation: Rantoul, IL, USA, 2007.

18. Tóth, C.; Ureczky, J. Determination of master curves for asphalt mixtures by means of IT-CY tests. Period. Polytech. Civ. Eng. 2010, 54, 137–142. [[CrossRef](https://doi.org/10.3311/pp.ci.2010-2.09)]

19. Benedetto, H.D. Modelling the rheological properties of bituminous binders using the 2S2P1D Model. Constr. Build. Mater. 2013, 38, 395–406.

20. EN 12697-6; Bituminous Mixtures—Test Methods—Part 6: Determination of Bulk Density of Bituminous Specimens. European Committee for Standardization: Brussels, Belgium, 2018.

21. EN 12697-5; Bituminous Mixtures—Test Methods—Part 5: Determination of the Maximum Density. European Committee for Standardization: Brussels, Belgium, 2018.

22. EN 12697-12; Bituminous Mixtures—Test Methods—Part 12: Determination of the Water Sensitivity of Bituminous Specimens. European Committee for Standardization: Brussels, Belgium, 2018.

23. EN 12697-44; Bituminous Mixtures—Test Methods—Part 44: Crack Propagation by Semi-Circular Bending Test. European Committee for Standardization: Brussels, Belgium, 2019.

24. EN 1426; Bitumen and Bituminous Binders—Determination of Needle Penetration. European Committee for Standardization: Brussels, Belgium, 2015.

25. EN 1427; Bitumen and Bituminous Binders—Determination of the Softening Point—Ring and Ball Method. European Committee for Standardization: Brussels, Belgium, 2015.

26. CSN 73 6121:2019 ˇ ; Road Building—Asphalt Pavement Courses—Construction and Conformity Assessment. Cesk ˇ á agentura pro Standardizaci: Prague, Czech Republic, 2019.

27. EN 13 108-1; Bituminous Mixtures—Material Specifications–Part 1: Asphalt Concrete. European Committee for Standardization: Brussels, Belgium, 2017.

28. EN 12697-33; Bituminous Mixtures—Test Method—Part 33: Specimen Prepared by Roller Compactor. European Committee for Standardization: Brussels, Belgium, 2019.

29. Booshehrian, A.; Mogawer, W.S.; Bonaquist, R. How to Construct an Asphalt Binder Master Curve and Assess the Degree of Blending between RAP and Virgin Binders. J. Mater. Civ. Eng. 2013, 25, 1813–1821. [[CrossRef](https://doi.org/10.1061/%28ASCE%29MT.1943-5533.0000726)]

30. Adams, Y.E.; Zeghal, M.; El Hussein, H.M. Complex Modulus Test Protocol and Procedure for Determining Huet-Sayegh Model Parameters; NRC-CNRC; National Research Council of Canada: Ottawa, ON, Canada, 2006.

**Disclaimer/Publisher’s Note:** The statements, opinions and data contained in all publications are solely those of the individual author(s) and contributor(s) and not of MDPI and/or the editor(s). MDPI and/or the editor(s) disclaim responsibility for any injury to people or property resulting from any ideas, methods, instructions or products referred to in the content.