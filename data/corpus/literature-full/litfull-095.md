<!--
SOURCE: 原始 PDF: City_Contest/ref/083 Parallel Bayesian Optimization of Multiple Noisy Objectives with Expected Hyperv.pdf | 页数: 40 | 集合: city_contest_ref
题录: litfull-nolit-083-parallel-bayesian-optimization-of-multiple-noi 083 Parallel Bayesian Optimization of Multiple Noisy Objectives with Expected Hyperv (DOI: 10.1007/s10472-015-9463-9.)
提取: MinerU markdown 全文（可重建索引的真相源副本；images/ 不入 corpus）
-->
# Parallel Bayesian Optimization of Multiple Noisy Objectives with Expected Hypervolume Improvement

**Samuel Daulton** Facebook, University of Oxford sdaulton@fb.com

**Maximilian Balandat** Facebook balandat@fb.com

**Eytan Bakshy** Facebook ebakshy@fb.com

## Abstract

Optimizing multiple competing black-box objectives is a challenging problem in many fields, including science, engineering, and machine learning. Multi-objective Bayesian optimization (MOBO) is a sample-efficient approach for identifying the optimal trade-offs between the objectives. However, many existing methods perform poorly when the observations are corrupted by noise. We propose a novel acquisition function, NEHVI, that overcomes this important practical limitation by applying a Bayesian treatment to the popular expected hypervolume improvement (EHVI) criterion and integrating over this uncertainty in the Pareto frontier. We argue that, even in the noiseless setting, generating multiple candidates in parallel is an incarnation of EHVI with uncertainty in the Pareto frontier and therefore can be addressed using the same underlying technique. Through this lens, we derive a natural parallel variant, qNEHVI, that reduces computational complexity of parallel EHVI from exponential to polynomial with respect to the batch size. qNEHVI is one-step Bayes-optimal for hypervolume maximization in both noisy and noiseless environments, and we show that it can be optimized effectively with gradient-based methods via sample average approximation. Empirically, we demonstrate not only that qNEHVI is substantially more robust to observation noise than existing MOBO approaches, but also that it achieves state-of-the-art optimization performance and competitive wall-times in large-batch environments.

## 1 Introduction

Black-box optimization problems that involve multiple competing noisy objectives are ubiquitous in science and engineering. For example, a real-time communications service may be interested in tuning the parameters of a control policy to adapt video quality in real time in order to maximize video quality and minimize latency [10, 17]. In robotics, scientists may seek to design hardware components that maximize locomotive speed and minimize energy expended [8, 38]. In agriculture, development agencies may seek to balance crop yield and environmental impact [28]. For such multi-objective optimization (MOO) problems, there typically is no single solution that is best with respect to all objectives. Rather, the goal is to identify the Pareto frontier: a set of optimal trade-offs such that improving one objective means deteriorating another. In many cases, the objectives are expensive to evaluate. For instance, randomized trials used in agriculture and the internet industry may take weeks or months to conduct and incur opportunity costs, and manufacturing and testing hardware is both costly and time-consuming. Therefore, it is imperative to be able to identify good trade-offs with as few objective evaluations as possible.

Bayesian optimization (BO), a method for efficient global black-box optimization, is often used to tackle such problems. BO employs a probabilistic surrogate model in conjunction with an acquisition function to navigate the trade-off between exploration (evaluating designs with high uncertainty) and exploitation (evaluating designs that are believed to be optimal). Although a significant number of works have explored multi-objective Bayesian optimization (MOBO), most available methods [3, 39, 51, 60] do not take into account the fact that, in practice, observations are often subject to noise. For example, results of an A/B test are highly variable due to heterogeneity in the underlying user population and other factors. Agricultural trials are affected by the stochastic nature of plant growth and environmental factors such as soil composition or wind currents. In robotics, devices are subject to manufacturing tolerances, and observations of quantities such as locomotive speed and efficiency may be corrupted by measurement error from noisy sensors and environmental factors such as temperature or surface friction. While previous work has shown that a principled treatment of noisy observations can significantly improve optimization performance in the single-objective case [24, 37], this issue is understudied in the multi-objective setting. Furthermore, many applications in which evaluations take a long time require evaluating large batches of candidates in parallel in order to achieve reasonable throughput. For example, when firms optimize systems via A/B tests, it may take several weeks to test any particular configuration. Because of this, large batches of candidate policies are tested simultaneously [36]. In biochemistry and materials design, dozens of tests can be conducted parallel on a single microplate [63]. Even in sophisticated high throughput chemistry settings, these batches may take several hours or days to set up and evaluate [42]. Most existing MOBO methods, however, are either designed for purely sequential optimization [3, 51] or do not scale well to large batch sizes [11].

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">35th Conference on Neural Information Processing Systems (NeurIPS 2021)</span></small>

**Contributions:** In this work, we propose a novel MOBO algorithm, based on expected hypervolume improvement (EHVI), that scales to highly parallel evaluations of noisy objectives. Our approach is made possible by a general-purpose, differentiable, cached box decomposition (CBD) implementation that dramatically speeds up critical computations needed to account for uncertainty introduced by noisy observations and generate new candidate points for highly parallel batch or asynchronous evaluation. In particular, our CBD-based approach solves the fundamental problem of scaling parallel EHVI-based methods to large batch sizes, reducing time and space complexity from exponential to polynomial. Our proposed algorithm, noisy expected hypervolume improvement (NEHVI), is the onestep Bayes-optimal policy for hypervolume improvement and provides state-of-the-art performance across a variety of benchmarks. To our knowledge, our work provides the most extensive evaluation of noisy parallel MOBO to date. A high-quality implementation of $q \mathrm { N E H V I }$ , as well as many of the baselines considered here, will be made available as open-source software upon publication.

## 2 Preliminaries

Our goal is to find the set of optimal designs x over a bounded set $\mathcal { X } \subset \mathbb { R } ^ { d }$ that maximize one or more objectives $\pmb { f } ( \pmb { x } ) \in \mathbb { R } ^ { M }$ , with no known analytical expression nor gradient information of $f .$

**Multi-Objective Optimization (MOO)** aims to identify the set of Pareto optimal objective tradeoffs. We say a solution $\pmb { f } ( \pmb { x } ) = \left[ \overbrace { f ^ { ( 1 ) } ( \pmb { x } ) } , . . . , f ^ { ( M ) } ( \pmb { x } ) \right]$ dominates another solution ${ \pmb f } ( { \pmb x } ) \succ { \pmb f } ( { \pmb x } ^ { \prime } )$ if $f ^ { ( m ) } ( { \pmb x } ) \geq f ^ { ( m ) } ( { \pmb x } ^ { \prime } )$ for $m = 1 , . . . , M$ and ∃ $\underset {} { n \in \{ 1 , . . . , M \} } { \overset { \cdot } { \mathrm { s . t . } } } f ^ { ( m ) } ( \pmb { x } ) > f ^ { ( m ) } ( \pmb { x } ^ { \prime } )$ We define the Pareto frontier as $\mathcal { P } ^ { * } = \{ \pmb { f } ( \pmb { x } ) : \pmb { x } \in \mathcal { X } , \; \nexists \; \pmb { x } ^ { \prime } \in \mathcal { X } \; s . t . \; \pmb { \hat { f } } ( \pmb { x } ^ { \prime } ) \succ \pmb { \hat { f } } ( \pmb { x } ) \}$ , and denote the set of Pareto optimal designs as $\mathcal { X } ^ { * } = \{ \pmb { x } : \pmb { f } ( \pmb { x } ) \in \mathcal { P } ^ { * } \}$ . Since the Pareto frontier (PF) is often an infinite set of points, MOO algorithms usually aim to identify a finite approximate PF P. A natural measure of the quality of a PF is the hypervolume of the region of objective space that is dominated by the PF and bounded from below by a reference point. Provided with the approximate PF, the decision-maker can select a particular Pareto optimal trade-off according to their preferences.

**Bayesian Optimization (BO)** is a sample-efficient optimization method that leverages a probabilistic surrogate model to make principled decisions to balance exploration and exploitation [19, 50]. Typically, the surrogate is a Gaussian Process (GP), a flexible, non-parametric model known for its well-calibrated predictive uncertainty [47]. To decide which points to evaluate next, BO employs an acquisition function $\alpha ( \cdot )$ α(·) that specifies the value of evaluating a set of new points x based on the surrogate’s predictive distribution at . While evaluating the true black-box function $f$ is timeconsuming or costly, evaluating the surrogate is cheap and relatively fast; therefore, numerical optimization can be used to find the maximizer of the acquisition function $\pmb { x } ^ { * } = \operatorname { a r g } \operatorname { m a x } _ { \pmb { x } \in \mathcal { X } } \alpha ( \pmb { x } )$ to evaluate next on the black-box function. BO sequentially selects new points to evaluate and updates the model to incorporate the new observations.

Evolutionary algorithms (EAs) such as NSGA-II [12] are a popular choice for solving MOO problems (see Zitzler et al. [67] for a review of various other approaches). However, EAs generally suffer from high sample complexity, rendering them infeasible for optimizing expensive-to-evaluate black-box functions. Multi-objective Bayesian optimization (MOBO), which combines a Bayesian surrogate with an acquisition function designed for MOO, provides a much more sample-efficient alternative.

## 3 Related Work

Methods based on hypervolume improvement (HVI) seek to expand the volume of the objective space dominated by the Pareto frontier. Expected hypervolume improvement (EHVI) [16] is a natural extension of the popular expected improvement (EI) [29] acquisition function to the MOO setting. Recent work has led to efficient computational paradigms using box decomposition algorithms [59] and practical enhancements such as support for parallel candidate generation and gradient-based acquisition optimization [11, 58]. However, EHVI still suffers from some limitations, including (i) the assumption that observations are noise-free, and (ii) the exponential scaling of its batch variant, qEHVI, in the batch size q, which precludes large-batch optimization. DGEMO [39] is a recent method for parallel MOBO that greedily maximizes HVI while balancing the diversity of the design points being sampled. Although DGEMO scales well to large batch sizes, it does not account for noisy observations. TSEMO [5] is a Thompson sampling (TS) heuristic that can acquire batches of points by optimizing a random fourier feature (RFF) [46] approximation of a GP surrogate using NSGA-II and selecting a subset of points from the EA’s population to sequentially greedily maximize HVI. This heuristic approach for maximizing HVI currently has no theoretical guarantees and relies on zeroth-order optimization methods, which tend to be slower and exhibit worse optimization performance than gradient-based approaches.

Entropy-based methods such as PESMO [25], MESMO [3], and PFES [51] are an alternative to EHVI. Of these three methods, PESMO is the only one that accounts for observation noise. However, PESMO involves intractable entropy computations and therefore relies on complex approximations, as well as challenging and time-consuming numerical optimization procedures [25]. Garrido-Merchán & Hernández-Lobato [21] recently proposed an extension to PESMO that supports parallel candidate generation. However, the authors of this work provide limited evaluation and have not provided code to reproduce their results.<sup>1</sup>

MOO can also be cast into a single-objective problem by applying a random scalarization of the objectives. ParEGO maximizes the expected improvement using random augmented Chebyshev scalarizations [32]. MOEA/D-EGO [64] extends ParEGO to the batch setting using multiple random scalarizations and the genetic algorithm MOEA/D [65] to optimize these scalarizations in parallel. Recently, qParEGO, another batch variant of ParEGO was proposed that uses compositional Monte Carlo objectives and sequential greedy candidate selection [11]. Additionally, the authors proposed a noisy variant, qNParEGO, but the empirical evaluation of that variant was limited. TS-TCH [45] combines random Chebyshev scalarizations with Thompson sampling [54], which is naturally robust to noise when the objective is scalarized. Golovin & Zhang [23] propose to use a hypervolume scalarization with the property that the expected value of the scalarization over a specific distribution of weights is equivalent to the hypervolume indicator. The authors propose a upper confidence bound algorithm using randomly sampled weights, but provide a very limited empirical evaluation.

Many prior attempts by the simulation community to handle MOO with noisy observations found that accounting for the noise did not improve optimization performance: Horn et al. [26] suggest that the best approach is to ignore noise, and Koch et al. [33] concluded that further research was needed to determine if modeling techniques such as re-interpolation could improve BO performance with noisy observations. In contrast, we find that accounting for noise does substantially improve performance in noisy settings.

Lastly, previous works have considered methods for quantifying and monitoring uncertainty in the Pareto frontiers during the optimization [4, 7]. In contrast, we provide a solution to performing MOBO in noisy settings, rather than purely reasoning about the uncertainty in the Pareto frontier.

## 4 Background on Expected Hypervolume Improvement

In this section, we review hypervolume, hypervolume improvement, and expected hypervolume improvement as well as efficient methods for computing these metrics using box decompositions.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>We contacted the authors twice asking for code to reproduce their results, but they graciously declined.</span></small>

**Definition 1.** The hypervolume indicator (HV) of a finite approximate Pareto frontier $\mathcal { P }$ is the M-dimensional Lebesgue measure λ<sub>M</sub> of the space dominated by $\mathcal { P }$ and bounded from below by a reference point. $\begin{array} { r } { \pmb { r } \in \mathring { \mathbb { R } ^ { M } } \colon \mathrm { H V } ( \mathcal { P } | \pmb { r } ) \overset { \sim } { = } \mathring { \lambda _ { M } } \big ( \bigcup _ { \pmb { v } \in \mathcal { P } } [ \pmb { r } , \pmb { v } ] \big ) } \end{array}$ , where [r, v] denotes the hyper-rectangle bounded by vertices r and v.

As in previous work, we assume that the reference point r is known and specified by the decision maker [58].

**Definition 2.** The hypervolume improvement (HVI) of a set of points $\mathcal { P } ^ { \prime }$ w.r.t. an existing approximate Pareto frontier P and reference point r is defined $\widetilde { \mathit { a s } ^ { 2 } } \operatorname { H V I } ( \widetilde { \mathcal { P } } ^ { \prime } | \mathcal { P } , \boldsymbol { r } ) = \operatorname { H V } ( \mathcal { P } \cup \mathcal { P } ^ { \prime } | \boldsymbol { r } ) \overset { \circ } { - } \operatorname { H V } ( \mathcal { P } | \boldsymbol { r } )$

Computing HV requires calculating the volume of a typically non-rectangular polytope and is known to have time complexity that is super-polynomial in the number of objectives [59]. An efficient approach for computing HV is to (i) decompose the region that is dominated by the Pareto frontier $\mathcal { P }$ and bounded from below by the reference point r into disjoint axis-aligned hyperrectangles [34], (ii) compute the volume of each hyperrectangle in the decomposition, and (iii) sum over all hyperrectangles. So-called box decomposition algorithms have also been applied to partition the region that is not dominated by the Pareto frontier $\mathcal { P } ,$ which can be used to compute the HVI from a set of new points [15, 59]. See Appendix B for further details.

**Expected Hypervolume Improvement:** Since function values at unobserved points are unknown in black-box optimization, so is the HVI of an out-of-sample point. However, in BO the probabilistic surrogate model provides a posterior distribution $p ( \pmb { f } ( \pmb { x } ) | \pmb { \mathcal { D } } )$ over the function values for each x, which can be used to compute the expected hypervolume improvement (EHVI) acquisition function: $\alpha _ { \mathrm { E H V I } } ( { \pmb x } | { \mathcal P } )   =   \mathbb { E } \big [ \mathrm { H V I } ( \bar { { \pmb f } } ( { \pmb x } ) | { \mathcal P } ) \big ]$ . Although <sup>α</sup>EHVI can be expressed analytically when (i) the objectives are assumed to be conditionally independent given x and (ii) the candidates are generated and evaluated sequentially [58], Monte Carlo (MC) integration is commonly used since it does not require either assumption [16]. The more general parallel variant using MC integration is given by

$$
\alpha _ { q \tt E H V I } ( \mathcal { X } _ { \tt c a n d } | \mathcal { P } ) \approx \hat { \alpha } _ { q \tt E H V I } ( \mathcal { X } _ { \tt c a n d } | \mathcal { P } ) = \frac { 1 } { N } \sum _ { t = 1 } ^ { N } \operatorname { H V I } ( \tilde { \mathbf { \mathit { f } } } _ { t } ( \mathcal { X } _ { \tt c a n d } ) | \mathcal { P } ) ,\tag{1}
$$

where $\tilde { \pmb { f } } _ { t }   \sim   p ( \pmb { f } | \mathcal { D } )$ for $t   =   1 , . . . , N$ and $\mathcal { X } _ { \mathrm { c a n d } }   =   \{ x _ { i } \} _ { i = 1 } ^ { q }     [ 1 1 ]$ The same box decomposition algorithms used to compute HVI can be used to compute EHVI (either analytic or via MC) using piece-wise integration. EHVI computation is agnostic to the choice of box decomposition algorithm (and can also use approximate methods [9]). Similar to EI in the single-objective case, EHVI is a one-step Bayes-optimal algorithm for maximizing hypervolume in the MOO setting under the following assumptions: (i) only a single design will be generated and evaluated, (ii) the observations are noise-free, (iii) the final approximate Pareto frontier (and final design that will be deployed) will be drawn from the set of observed points [19].

## 5 Expected Hypervolume Improvement with Noisy Observations

We consider the case that frequently arises in practice where we only receive noisy observations $\pmb { y } _ { i } = \pmb { f } ( \pmb { x } _ { i } ) + \pmb { \epsilon } _ { i } ,   \pmb { \epsilon } _ { i } \sim \mathcal { N } ( 0 , \Sigma _ { i } )$ , where $\Sigma _ { i }$ is the noise covariance. In this setting, EHVI is no longer (one-step) Bayes-optimal. This is because we can no longer compute the true Pareto frontier $\mathcal { P } _ { n } = \{ \pmb { f } ( \pmb { x } ) \mid \pmb { x } \in \dot { X } _ { n } , \; \nexists \; \pmb { x } ^ { \prime } \in X _ { n } \; s . t . \; \pmb { f } ( \pmb { x } ^ { \prime } ) \succ \pmb { f } ( \pmb { x } ) \}$ over the previously evaluated points $X _ { n } =$ $\{ \pmb { x } _ { i } \} _ { i = 1 } ^ { n } .$ Simply using the observed Pareto frontier, $\widehat { \mathcal { Y } } _ { n } = \{ \mathbf { y } \mid \mathbf { y } \in Y _ { n } , \: \nexists \: \mathbf { y } ^ { \prime } \in Y _ { n } \: { s . t . } \: \mathbf { y } ^ { \prime } \succ \mathbf { y } , y \}$ where $\bar { Y } _ { n }   =   \{ \pmb { y } _ { i } \} _ { i = 1 } ^ { n }$ , can have strong detrimental effects on optimization performance. This is illustrated in Figure 1, which shows how EHVI is misled by noisy observations that appear to be Pareto optimal. EHVI proceeds to spend its evaluation budget trying to optimize noise, resulting in a clumped Pareto frontier that lacks diversity. Although the posterior mean could serve as a "plug-in" estimate of the true function values at the observed points and provide some regularization [61], we find that this heuristic also leads to clustered Pareto frontiers (EHVI-PM in Fig. 1). Similar patterns emerge with DGEMO (which does not account for noise), and other baselines that utilize the posterior mean rather than the observed values when computing hypervolume improvement (see Appendix H). To our knowledge, all previous work on EHVI assumes that observations are noiseless [16, 58] or imputes the unknown true function values with the posterior mean.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>2</sup>For brevity we omit the reference point r when referring to HVI.</span></small>

![](images/page_4_chart_0.jpg)

Figure 1: An illustration of the effect of noisy observations on the true noiseless Pareto frontiers identified by NEHVI (our proposed algorithm), EHVI, and EHVI-PM, which uses the modeled posterior mean as point estimate of the true in-sample function values. All algorithms are tested on a BraninCurrin synthetic problem, where observations are corrupted with zero-mean, additive Gaussian noise with a standard deviation of 5% of the range of respective objective. All methods use sequential $( q = 1 )$ optimization. See Appendix G for details.

## 5.1 A Bayes-optimal algorithm for hypervolume maximization in noisy environments

In contrast with EHVI(-PM), we instead approach the problem of hypervolume maximization under noisy observations from a Bayesian perspective and derive a novel one-step Bayes-optimal expected hypervolume improvement criterion that iterates the expectation over the posterior distribution $\widetilde { p ( \mathbf { \hat { f } } ( X _ { n } ) | \mathcal { D } _ { n } ) }$ of the function values at the previously evaluated points $X _ { n }$ given noisy observations $\widehat { \mathcal { D } _ { n } } = \{ \dot { \mathbf { \mathit { x } } } _ { i } , \mathbf { \mathit { y } } _ { i } , ( \Sigma _ { i } ) \} _ { i = 1 } ^ { n }$ . Our acquisition function, noisy expected hypervolume improvement (NEHVI), is defined as

$$
\alpha _ { \mathrm { N E H V I } } ( \pmb { x } ) = \int \alpha _ { \mathrm { E H V I } } ( \pmb { x } | \mathcal { P } _ { n } ) p ( \pmb { f } | \mathcal { D } _ { n } ) d \pmb { f } ,\tag{2}
$$

where $P _ { n }$ denotes the Pareto frontier over $\boldsymbol { f } ( X _ { n } )$

By integrating over the uncertainty in the function values at the observed points, NEHVI retains one-step Bayes-optimality in noisy environments (in noiseless environments, NEHVI is equivalent to EHVI). Empirically, Figure 1 shows that NEHVI is robust to noise and identifies a well-distributed Pareto frontier with no signs of clumping, even under very noisy observations.<sup>3</sup>

The integral in (2) is analytically intractable, but can easily be approximated using MC integration. Let $\tilde { \pmb { f } } _ { t }   \sim   p ( \pmb { f } | D _ { n } )$ for $t   =   1 , . . . N$ be samples from the posterior, and let $\mathcal { P } _ { t }   =   \{ \tilde { f } _ { t } ( { \pmb x } ) | { \pmb x }   \in$ $X _ { n } , \tilde { \pmb { f } } _ { t } ( \pmb { x } ) \succ \tilde { \pmb { f } } _ { t } ( \pmb { x } ^ { \prime } ) \; \forall \; \pmb { x } ^ { \prime } \in X _ { n } \}$ be the Pareto frontier over the previously evaluated points under the sampled function $\tilde { f } _ { t }$ . Then, αNEHVI $\begin{array} { r } { ( \pmb { x } ) \approx \frac { 1 } { N } \sum _ { t = 1 } ^ { N } \alpha _ { \mathrm { E H V I } } ( \pmb { x } | \mathcal { P } _ { t } ) } \end{array}$ . Using MC integration, we can compute the inner expectation in $\alpha _ { \mathrm { E H V I } }$ simultaneously using samples from the joint posterior $\tilde { \mathbf { \mathit { f } } } _ { t } ( X _ { n } , \mathbf { \mathit { x } } ) \sim p ( \mathbf { \mathit { f } } ( X _ { n } , \mathbf { \mathit { x } } ) | \mathcal { D } _ { n } )$ over x and $X _ { n }$

$$
\hat { \alpha } _ { \mathrm { N E H V I } } ( \boldsymbol { x } ) = \frac { 1 } { N } \sum _ { t = 1 } ^ { N } \mathrm { H V I } ( \tilde { \boldsymbol { f } } _ { t } ( \boldsymbol { x } ) | \mathcal { P } _ { t } ) .\tag{3}
$$

See Appendix B for details on computing (3) using box decompositions. Note that this “full-MC” variant of NEHVI does not require objectives to be modeled independently, and supports multi-task covariance functions across correlated objectives.

## 5.2 Parallel Noisy Expected Hypervolume Improvement

Generating and evaluating batches of candidates is imperative to achieving adequate throughput in many real-world scenarios. qNEHVI can naturally be extended to the parallel (asynchronous or batch) setting by evaluating HVI with respect to a batch of q points $\mathcal { X } _ { \mathrm { c a n d } } = \{ \boldsymbol { x } _ { i } \} _ { i = } ^ { q }$ 1

$$
\alpha _ { q \mathrm { N E H V I } } ( \mathcal { X } _ { \mathrm { c a n d } } ) = \int \alpha _ { q \mathrm { E H V I } } ( \mathcal { X } _ { \mathrm { c a n d } } | \mathcal { P } _ { n } ) p ( \pmb { f } | \mathcal { D } _ { n } ) d \pmb { f } \approx \hat { \alpha } _ { q \mathrm { N E H V I } } ( \mathcal { X } _ { \mathrm { c a n d } } ) = \frac { 1 } { N } \sum _ { t = 1 } ^ { N } \mathrm { H V I } ( \tilde { \pmb { f } } _ { t } ( \mathcal { X } _ { \mathrm { c a n d } } ) | \mathcal { P } _ { t } )\tag{4}
$$

Since optimizing $q$ candidates jointly is a difficult numerical optimization problem over a $q d -$ dimensional domain, we use a sequential greedy approximation in the parallel setting and solve a sequence of $q$ simpler optimization problems with d dimensions, which been shown empirically to improve optimization performance [57]. While selecting candidates according to a “sequential greedy” policy does not guarantee that the selected batch of candidates is a maximizer of the $\alpha _ { q \mathrm { N E H V I } } ,$ the submodularity of $\alpha _ { q \mathrm { N E H V I } }$ allows us to bound the regret of this approximation to be no more than $\begin{array} { r } { \frac { 1 } { e } \alpha _ { q \mathrm { N E H V I } } ^ { * } , \mathrm { w h e r e } \; \alpha _ { q \mathrm { N E H V I } } ^ { * } = \operatorname* { m a x } _ { \mathcal { X } _ { \mathrm { c a n d } } \in \mathcal { X } } \alpha _ { q \mathrm { N E H V I } } ( \mathcal { X } _ { \mathrm { c a n d } } ) } \end{array}$ (see Appendix F).

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>3</sup>This noise level is 5x greater than the ones considered by previous works that evaluate noisy MOBO [25].</span></small>

## 6 Efficient Evaluation with Cached Box Decompositions

Although $\hat { \alpha } _ { \mathrm { N E H V I } } ( \pmb { x } )$ in (3) has a concise mathematical form, computing it requires determining the Pareto frontier $\mathcal { P } _ { t }$ under each sample $\tilde { f } _ { t }$ for $t = 1 , . . . , N$ and then partitioning the region that is not dominated by $\mathcal { P } _ { t }$ into disjoint hyperrectangles $\{ S _ { k _ { t } } \} _ { k _ { t } = 1 } ^ { K _ { t } }$ . Optimizing the unbiased MC estimator of αNEHVI would require re-sampling $\{ \tilde { \pmb { f } } _ { t } \} _ { t = 1 } ^ { N }$ at each evaluation of αNEHVI. However, computing the Pareto frontier and performing a box decomposition under each of the $N$ samples during every evaluation of $\alpha _ { \mathrm { N E H V I } }$ in the inner optimization loop $\begin{array} { r } { ( \pmb { x } ^ { * }   =   \arg \operatorname* { m a x } _ { \pmb { x } } \alpha _ { \mathrm { N E H V I } } ( \pmb { x } | \mathcal { D } _ { n } ) ) } \end{array}$ would be prohibitively expensive. This is because box decomposition algorithms have super-polynomial time complexity in the number of objectives [59]. We instead propose an efficient alternative computational technique for repeated evaluations of EHVI with uncertain Pareto frontiers.

**Cached Box Decompositions:** For repeated evaluations of the integral in (2), we use a set of fixed samples $\{ \tilde { f } _ { t } ( X _ { n } ) \} _ { t = 1 } ^ { N }$ , which allows us to compute the Pareto frontiers and box decompositions once, and cache them for the entirety of the acquisition function optimization, thereby making those two computationally intensive operations a one-time cost per BO iteration.<sup>4</sup> We refer to this approach as using cached box decompositions (CBD). The method of optimizing over fixed random samples is known as sample average approximation (SAA) [2].

**Conditional Posterior Sampling:** Under the CBD formulation, computing $\hat { \alpha } _ { \mathrm { N E H V I } } ( \pmb { x } )$ with joint samples from $\tilde { \mathbf { \mathit { f } } } _ { t } ( X _ { n } , \mathbf { \mathit { x } } ) \sim p ( \mathbf { \mathit { f } } ( X _ { n } , \mathbf { \mathit { x } } ) | \mathcal { D } _ { n } )$ requires sampling from the conditional distributions

$$
\tilde { \pmb { f } } _ { t } ( \pmb { x } ) \sim p \big ( \pmb { f } ( \pmb { x } ) | \pmb { f } ( X _ { n } ) = \tilde { \pmb { f } } _ { t } ( X _ { n } ) , \mathcal { D } _ { n } \big ) ,\tag{5}
$$

where $t = 1 , . . . , N$ and $\{ \tilde { \pmb { f } } _ { t } ( X _ { n } ) \} _ { t = 1 } ^ { N }$ are the realized samples at the previously evaluated points. For multivariate Gaussian posteriors (as is the case with GP surrogates), we can sample from $p ( \pmb { f } ( X _ { n } ) | \mathcal { D } _ { n } )$ via the reparameterization trick [30] by evaluating $\tilde { f } _ { t } ( \pmb { x } )   =   \pmb { \mu } _ { n } + L _ { n } ^ { T } \pmb { \zeta } _ { n , t } ,$ , where $\begin{array} { r } { \mathbf { \zeta } _ { n , t } \sim \mathcal { N } ( \mathbf { 0 } , I _ { n M } ) , \mathbf { \mu } _ { n } \in \mathbb { R } ^ { n M } } \end{array}$ is the posterior mean, and $L _ { n } \in \mathbb { R } ^ { n M \times n M }$ is a lower triangular root decomposition of the posterior covariance matrix, typically a Cholesky decomposition. Given $L _ { n } ,$ we can obtain a root decomposition $L _ { n } ^ { \prime }$ of the covariance matrix of the joint posterior $p ( \pmb { f } ( X _ { n } , \pmb { x } ) | \mathcal { D } _ { n } )$ by performing efficient low-rank updates [44]. Given $L _ { n } ^ { \prime }$ and the posterior mean of $p(\mathbf{f}(X_n, \mathbf{x}) | \mathcal{D}_n)$ we can sample from (5) via the reparameterization trick by augmenting the existing base samples $\zeta _ { n , t }$ with M new base samples for the new point.

## 6.1 Efficient Sequential Greedy Batch Selection using CBD

The CBD technique addresses the general problem of inefficient repeated evaluations of EHVI with uncertain Pareto frontiers. In this section, we show that sequential greedy batch selection (with both qEHVI and qNEHVI) is an incarnation of EHVI with uncertain Pareto frontiers.

The original formulation of parallel EHVI in Daulton et al. [11] uses the inclusion-exclusion principle (IEP), which involves computing the volume jointly dominated by each of the $2 ^ { q } - 1$ nonempty subsets of points in $\mathcal { X } _ { \mathrm { c a n d } } .$ . However, using large batch sizes is not computationally feasible under this formulation because time and space complexity are exponential in q and multiplicative in the number of hyperrectangles in the box decomposition [11] (see Appendix D for a complexity analysis). Although qEHVI is optimized using sequential greedy batch selection, the $\mathrm { I E P }$ is used over all candidates $\pmb { x } _ { 1 } , . . . , \pmb { x } _ { i }$ when selecting candidate i. Although the $\mathrm { I E P }$ could similarly be used to compute qNEHVI, we instead leverage CBD, which yields a sequential greedy approximation of the joint (noisy) EHVI that is mathematically equivalent to the IEP formulation, but significantly reduces computational overhead. That is, the IEP and CBD approaches produce exactly the same acquisition value for a given set of points $\mathcal { X } _ { \mathrm { c a n d } }$ , but the IEP and the CBD approaches have exponential and polynomial time complexities in $q ,$ respectively.

When selecting $x _ { i }$ for $i \in \{ 2 , \ldots , q \}$ , all $x _ { j }$ for which $j < i$ have already been selected and are therefore held constant. Thus, we can decompose qNEHVI into the qNEHVI from the previously selected candidates $\pmb { x } _ { 1 } , \dots , \pmb { x } _ { i - 1 }$ and NEHVI from $x _ { i }$ given the previously selected candidates

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">n</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>4</sup>For greater efficiency, we may also prune X to remove points that are dominated with high probability, which we estimate via MC.</span></small>

![](images/page_6_chart_0.jpg)

Figure 2: Acquisition optimization wall time under a sequential greedy approximation using L-BFGS-B. CBD enables scaling to much larger batch sizes q than using the IEP and avoids running out-of-memory (OOM) on a GPU. Independent GPs are used for each outcome. The Pareto frontier of of the 2-objective, 6- dimensional DTLZ2 problem [13] is initialized with 20 points. Wall times were measured on a Tesla V100 SXM2 GPU (16GB RAM) and a 2x Intel Xeon 6138 CPU @ 2GHz (251GB RAM). See Appendix H.2 for results with more objectives.

$$
\hat { \alpha } _ { q \operatorname { N E H V I } } ( \{ \mathbf { \mathit { x } } _ { j } \} _ { j = 1 } ^ { i } ) \mathop { = } \frac { 1 } { N } \sum _ { t = 1 } ^ { N } \operatorname { H V I } ( \{ \tilde { \mathbf { \mathit { f } } } _ { t } ( \mathbf { \mathit { x } } _ { j } ) \} _ { j = 1 } ^ { i - 1 } \} \operatorname { | } \mathcal { P } _ { t } ) \mathop { + } \frac { 1 } { N } \sum _ { t = 1 } ^ { N } \operatorname { H V I } ( \tilde { \mathbf { \mathit { f } } } _ { t } ( \mathbf { \mathit { x } } _ { i } ) \operatorname { | } \mathcal { P } _ { t } \cup \{ \tilde { \mathbf { \mathit { f } } } _ { t } ( \mathbf { \mathit { x } } _ { j } ) \} _ { j = 1 } ^ { i - 1 } \} )\tag{6}
$$

Note that the first term on the right hand side is constant, since $\{ \pmb { x } _ { j } \} _ { j = 1 } ^ { i - 1 }$ and $\{ \tilde { \pmb { f } } _ { t } ( \pmb { x } _ { j } ) \} _ { j = 1 } ^ { i - 1 }$ are fixed for all $t   =   1 , . . . , N$ The second term is $\hat { \alpha } _ { \mathrm { N E H V I } } ( \pmb { x } _ { i } )$ , where the NEHVI is taken with respect to the Pareto frontier across $\pmb { f } ( X _ { n } , \pmb { x } _ { 1 } , . . . , \pmb { x } _ { i - 1 } )$ and computed using the fixed samples $\{ \tilde { \pmb { f } } _ { t } ( X _ { n } , \pmb { x } _ { 1 } , . . . \pmb { x } _ { i - 1 } ) \} _ { t = 1 } ^ { N }$ . To compute the second term when selecting candidate $x _ { i } ,$ the N Pareto frontiers and CBDs are updated to include $\{ \tilde { \pmb { f } } _ { t } ( X _ { n } , \pmb { x } _ { 1 } , . . . \pmb { x } _ { i - 1 } ) \} _ { t = 1 } ^ { N }$ . As in the sequential $q = 1$ setting, the box decompositions are only computed and cached while selecting each candidate point. See Appendix C.2 for a derivation of (6). Although we have focused on qNEHVI in the above, the CBD formulation for qEHVI is obtained by simply replacing $\mathcal { P } _ { t }$ with the Pareto frontier over the observed values ${ \mathcal { Y } } _ { n }$

Despite computing N box decompositions when selecting each candidate $x _ { i }$ for $i = 2 , . . . , q ,$ the CBD approach reduces the time and space complexity from exponential (under the IEP) to polynomial in q (see Appendix D for details on time and space complexity). Figure 2 shows the total acquisition optimization time (including box decompositions) for various batch sizes and demonstrates that using CBD allows to scale to batch sizes that are completely infeasible when using IEP.

## 7 Optimizing NEHVI

**Differentiability**: Importantly, $\hat { \alpha } _ { \mathrm { N E H V I } } ( \pmb { x } )$ is differentiable w.r.t. x. Although determining the Pareto frontier and computing the box decompositions are non-differentiable operations, these operations do not involve x, even when re-sampling from the joint posterior $p ( \pmb { f } ( X _ { n } , \pmb { x } ) | \mathcal { D } _ { n } )$ . Exact sample-path gradients of $\nabla _ { \pmb { x } } \hat { \alpha } _ { \mathrm { N E H V I } } ( \pmb { x } )$ can easily be computed using auto-differentiation in modern computational frameworks. This enables efficient gradient-based optimization of qNEHVI.<sup>5</sup>

**SAA Convergence Results:** In addition to approximating the outer expectation over $\boldsymbol { f } ( X _ { n } )$ with fixed posterior samples, we can similarly fix the base samples used for the new candidate point x. This approach yields a deterministic acquisition function, which enables using (quasi-) higher-order optimization methods to obtain fast convergence rates for acquisition optimization [2]. Importantly, we prove that the theoretical convergence guarantees on acquisition optimization under the SAA approach proposed by Balandat et al. [2] also hold for NEHVI.

**Theorem 1.** Suppose X is compact and f has a multi-output GP prior with continuously differentiable mean and covariance functions. Let $X _ { n } = \{ x _ { i } \} _ { i = 1 } ^ { n }$ denote the previously evaluated points and $\{ \zeta \} _ { t = 1 } ^ { N }$ be base samples $\zeta \sim \mathcal { N } ( \mathbf { 0 } , I _ { ( n + 1 ) M } )$ . Let αˆNEHVI denote the deterministic acquisition function computed using $\{ \zeta \} _ { t = 1 } ^ { N } \; a s \; \dot { \alpha _ { \mathrm { N E H V I } } ^ { N } }$ and define $\begin{array} { r } { S ^ { * } : = \arg \operatorname* { m a x } _ { \pmb { x } \in \mathcal { X } } \alpha _ { \mathrm { N E H V I } } ( \pmb { x } ) } \end{array}$ to be the set of maximizers of <sup>α</sup>NEHVI(<sup>x</sup>) over X . Suppose $\hat { \pmb { x } } _ { N } ^ { * } \in$ arg max $\iota _ { \pmb { x } \in \mathcal { X } }   \hat { \alpha } _ { \mathrm { N E H V I } } ^ { N } ( \pmb { x } )$ . Then (1) $\hat { \alpha } _ { \mathrm { N E H V I } } ^ { N } ( \hat { \pmb { x } } _ { N } ^ { * } )   \rightarrow   \alpha _ { \mathrm { N E H V I } } ( \pmb { x } _ { N } ^ { * } )$ almost surely, and (2) dis $\mathfrak { t } ( \hat { \pmb { x } } _ { N } ^ { * } , S ^ { * } )   \rightarrow   0 ,$ , where d $i s t ( \hat { \pmb x } _ { N } ^ { * } , \mathcal { S } ^ { * } ) : =$ $\operatorname* { i n f } _ { \pmb { x } \in S ^ { * } } | | \hat { \pmb { x } } _ { N } ^ { * } - \pmb { x } | |$ is the Euclidean distance between $\hat { \boldsymbol { x } } _ { N } ^ { * }$ and the set $S ^ { * }$

Theorem 1 also holds in the parallel setting, so qNEHVI enjoys the same convergence guarantees as NEHVI on acquisition optimization under the SAA. See Appendix E for further details and proof.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">α<sub>qNEHVI</sub></span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">αq</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>5</sup>One can also show that the gradient of the full MC estimator ˆ is an unbiased estimator of the gradient of the true joint noisy expected hypervolume improvement NEHVI. However, this result is not necessary for our SAA approach.</span></small>

## 8 Approximation of qNEHVI using Approximate GP Sample Paths

Although CBD yields polynomial complexity of qNEHVI with respect to $q$ (rather than exponential complexity with the IEP), it still requires computing N box decompositions and repeatedly evaluating the joint posterior over $\pmb { f } ( X _ { n } , \{ \pmb { x } _ { j } \} _ { j = 1 } ^ { i - 1 } )$ for selecting each candidate x<sub>i</sub> for $i = 1 , . . . , q .$ A cheaper alternative is to approximate the integral in (4) using a single approximate GP sample path $\tilde { f } _ { i }$ using RFFs when optimizing candidate $x _ { i } ,   \mathbf { A }$ single-sample approximation of qNEHVI, which we refer to as $q \mathbf { N E H V I - } 1$ , can be computed by using $\tilde { f } _ { i }$ as the sampled GP in (6). Since the RFF is a deterministic model, it is much less computationally expensive to evaluate than the GP posterior on out-of-sample points, and exact gradients of $q \mathbf { N E H \dot { V } I - \dot { I } }$ with respect to current candidate x<sub>i</sub> can be computed and used for efficient multi-start optimization of $q \mathbf { N E H V I - } 1$ using second-order gradient methods. $q \mathrm { N E H V I - 1 }$ requires CBD for efficient sequential greedy batch selection and gradient-based optimization, but does not use a sample average approximation for optimizing a new candidate $x _ { i } ;$ instead, it uses an approximate sample path. See Rahimi & Recht [46] for details on RFFs.

qNEHVI-1 is related to TSEMO in that both use sequential greedy batch selection using HVI based on RFF samples. However, TSEMO does not directly maximize HVI when selecting candidate $x _ { i } ,$ where $i = 1 , . . . , q ;$ rather, it relies on a heuristic approach of running NSGA-II on an RFF sample of each objective to create a discrete population of candidates and then selecting the point from the discrete population that maximizes HVI under the RFF sample. In contrast, qNEHVI-1 directly optimizes HVI under the RFF using exact sample-path gradients, which leads to improved optimization performance (see Appendix H). Furthermore, we find that qNEHVI-1 is significantly faster than TSEMO, because rather than using NSGA-II it uses second order gradient methods to optimize HVI (see Appendix H). Gradient-based optimization is only possible because CBD enables scalable, differentiable HVI computation. While the primary goal of this work is to develop a principled, scalable method for parallel EHVI in noisy environments, we include empirical comparisons with qNEHVI-1 throughout the appendix to demonstrate the generalizablility of the CBD approach and practical performance of the $q \mathrm { N E H V I - 1 }$ approximation. qNEHVI-1 achieves the fastest batch selection timesof any method tested on a GPU on every problem; in many cases, this is an order of magnitude speed-up over qNEHVI. Moreover, qNEHVI-1 has a remarkable ability to scale to large batch sizes when the dimensionality of optimization problem is modest. Further investigation of $q \mathrm { N E H V I - 1 }$ is needed, but we hope that the readers can recognize the ways in which qNEHVI can create broader opportunities for research into hypervolume improvement based acquisition functions.

## 9 Experiments

We empirically evaluate qNEHVI on a set of synthetic and real-world benchmark problems. We compare it against the following recently proposed methods from the literature: PESMO, MESMO (which we extend to the handle noisy observations using the noisy information gain from Takeno et al. [52]), PFES, DGEMO, MOEA/D-EGO, TSEMO, TS-TCH, qEHVI (and qEHVI-PM-CBD, which uses the posterior mean as a plug-in estimate for the function values at the in-sample points, along with CBD to scale to large batch sizes), and qNParEGO. We optimize all methods using multi-start L-BFGS-B with exact gradients (except for PFES, which uses gradients approximated via finite differences), including TS-TCH where we optimize approximate function samples using RFFs with 500 basis functions. We model each outcome with an independent GP with a Matérn 5/2 ARD kernel and infer the GP hyperparameters via maximum a posteriori (MAP) estimation. For all problems, we assume that the noise variances are observed (except ABR, where we infer the noise level). See Appendix G for more details on the experiments and acquisition function implementations.

We evaluate all methods using the logarithm of the difference in hypervolume between the true Pareto frontier and the approximate Pareto frontier recovered by the algorithm. Since evaluations are noisy, we compute the hypervolume dominated by the noiseless Pareto frontier across the observed points for each method.

**Synthetic Problems:** We consider a noisy variants of the BraninCurrin problem $( M = 2 , d = 2 )$ and the DTLZ2 problem $( M = 2 , d = 6 ) \: [ 1 3 ]$ , in which observations are corrupted with zero-mean additive Gaussian noise with standard deviation of 5% of the range of each objective for BraninCurrin and 10% for DTLZ2.

**Adaptive Bitrate (ABR) Control Policy Optimization:** ABR controllers are used for real-time communication and media streaming applications. Policies for these controllers must be tuned to deliver a high quality of experience with respect to multiple objectives [40]. In industry settings, A/B tests with dozens of policies are tested simultaneously since each policy may take days or weeks to evaluate, producing noisy measurements across multiple objectives. In this experiment, we tune policies to maximize video quality (bitrate) and minimize stall time. The policy has d = 4 parameters, which are detailed in Appendix G. We use the Park simulator [41] and sample a random set of 100 traces to obtain noisy measurements of the objectives under a given policy. For comparing the performance of different methods, we estimate the true noiseless objective using mean objectives across 300 traces. We infer a homoskedastic noise level jointly with the GP hyperparameters via MAP estimation.

![](images/page_8_chart_0.jpg)

Figure 3: Sequential optimization performance. The shaded region indicates two standard errors of the mean over 100 replications (only 20 replications were feasible for PESMO due to large runtimes).

**Vehicle Design Optimization:** Optimizing the design of the frame an automobile is important to maximizing passenger safety, vehicle durability and fuel efficiency. Evaluating a vehicle design is time-consuming, since either a vehicle must manufactured and crashed, or a nonlinear finite element-based crash analysis must be run to simulate a collision (which can take over 20 hours per run) [62]. Hence, evaluating many designs in parallel is critical for reducing end-to-end optimization time. Observations are often noisy due to manufacturing imperfections, measurement error, or non-deterministic simulations. In this experiment, we tune the d = 5 widths of various components of a vehicle’s frame to minimize proxy metrics for (1) fuel consumption, (2) passenger trauma in a full frontal collison, and (3) vehicle fragility [53]. See Appendix G for details. For this demonstration, we add zero-mean Gaussian noise with a standard deviation of 1% of the objective range, which roughly corresponds to the manufacturing noise level used in previous work [62].

## 9.1 Summary of Results:

We find that qNEHVI and qNEHVI-1 outperform all other methods on the noisy benchmarks, both in the sequential and parallel setting. In the sequential setting (Fig 3), qNEHVI and qNEHVI-1 are followed closely by qEHVI-PM, and in some cases, even qEHVI. TS-TCH is firmly in the middle of the pack, while information-theoretic acquisition functions appear to perform the worst. This is consistent across noise levels; for experiments where we add noise to the objectives, we consider noise levels ranging from 1% to 10% of the range of each objective (these are magnitudes of the noise often seen in practice). Previous works have only evaluated MOBO algorithms with noise levels of 1% [25]. In Appendix H, we perform a study showing that qNEHVI consistently performs best with increasing noise levels up to 30% of the range of each objective.

While parallel evaluation can provide optimization speedups on order of the batch size q, these evaluations do affect the overall sample complexity of the algorithm, since less information is available within the synchronous batch setting compared with fully sequential optimization. We find that, by and large, qNEHVI achieves the greatest hyper-volume for increasingly large batch sizes, and scales more elegantly relative to TS-TCH and the ParEGO variants (Fig 4). qNEHVI also consistently outperforms qEHVI-PM-CBD. In Appendix H, we observe that qNEHVI and qNEHVI-1 provides excellent anytime performance all values of q that we tested. We provide results on 4 additional test problems in Appendix H.3, and in Appendix H.8, we demonstrate that leveraging CBD and a single sample path approximation, qNEHVI-1 enables scaling to 5-objective problems, which is a first for an HVI-based method, to our knowledge.

![](images/page_9_chart_0.jpg)

Figure 4: The quality of the final Pareto frontier identified by each method with increasing batch sizes q given a budget of 224 function evaluations. qEHVI is only included for q = 1 and $q = 8$ because the IEP scales exponential with q. DGEMO is omitted on the ABR problem because it was prohibitively slow with time-consuming ABR simulations and on the VehicleSafety problem because DGEMO consistently crashed in the graph cutting algorithm.

In our experiments, we find that qNEHVI-1 is among the top performers on relatively lowdimensional problems. Given the strong performance of qNEHVI-1, we examine its performance as the dimensionality of the search space increases in Appendix H.5. We find that qNEHVI is more robust than qNEHVI-1 in higher-dimensional search spaces, but further investigation is needed into how the number of the Fourier basis functions affects the performance of qNEHVI-1 in highdimensional search spaces.

**Optimization wall time:** Across all experiments, we observe competitive wall times for optimizing qNEHVI and qNEHVI-1 (all wall time comparisons are provided in Appendix H). On a GPU, optimizing qNEHVI-1 incurs the lowest wall time of any method that we tested on every single problem and optimizing qNEHVI is faster than optimizing information-theoretic methods on all problems. Using efficient low-rank Cholesky updates, qNEHVI is often faster than the qNParEGO implementation in BoTorch on a GPU.

## 10 Discussion

We proposed NEHVI, a novel acquisition function that provides a principled approach to parallel and noisy multi-objective Bayesian optimization. NEHVI is a one-step Bayes-optimal policy for maximizing the hypervolume dominated by the Pareto frontier in noisy and noise-free settings. NEHVI is made feasible by a new approach to computing joint hypervolumes (CBD), and we demonstrated that CBD enables scalable, parallel candidate generation with both noiseless qEHVI and qNEHVI. We provide theoretical results on optimizing a MC estimator of qNEHVI using sample average approximation and demonstrate significant improvements in optimization performance over state-of-the-art MOBO algorithms.

Yet, our work has some limitations. While the information-theoretic acquisition functions tested here perform poorly on our benchmarks, they do allow for decoupled evaluations of different objectives in cases where querying one objective may be more resource-intensive than querying other objectives. Optimizing such acquisition functions is a non-trivial task, and it is possible that with improved procedures, such acquisition functions could yield improved performance and provide a principled approach to selecting evaluation sources on a budget. Although practically fast enough for most Bayesian optimization tasks, exact hypervolume computation has super-polynomial complexity in the number of objectives. Combining qNEHVI with differentiable approximate methods for computing hypervolume (e.g. Couckuyt et al. [9], Golovin & Zhang [23]) could lead to further speed-ups.

We hope that the core ideas presented in this work, including the CBD approach, can provide a framework to support the development of new computationally efficient MOBO methods.

## References

[1] Asadpour, A., Nazerzadeh, H., and Saberi, A. Stochastic submodular maximization. In Papadimitriou, C. and Zhang, S. (eds.), Internet and Network Economics. Springer Berlin Heidelberg, 2008.

[2] Balandat, M., Karrer, B., Jiang, D. R., Daulton, S., Letham, B., Wilson, A. G., and Bakshy, E. BoTorch: A Framework for Efficient Monte-Carlo Bayesian Optimization. In Advances in Neural Information Processing Systems 33, 2020.

[3] Belakaria, S., Deshwal, A., and Doppa, J. R. Max-value entropy search for multi-objective bayesian optimization. In Advances in Neural Information Processing Systems 32, 2019.

[4] Binois, M., Ginsbourger, D., and Roustant, O. Quantifying uncertainty on pareto fronts with gaussian process conditional simulations. Eur. J. Oper. Res., 243:386–394, 2015.

[5] Bradford, E., Schweidtmann, A. M., and Lapkin, A. Efficient multiobjective optimization employing gaussian processes, spectral sampling and a genetic algorithm. Journal of global optimization, 71(2):407–438, 2018.

[6] Brockhoff, D., Tusar, T., Auger, A., and Hansen, N. Using well-understood single-objective functions in multiobjective black-box optimization test suites, 2019.

[7] Calandra, R. and Peters, J. Pareto front modeling for sensitivity analysis in multi-objective bayesian optimization. 2014.

[8] Calandra, R., Seyfarth, A., Peters, J., and Deisenroth, M. P. Bayesian optimization for learning gaits under uncertainty. Annals of Mathematics and Artificial Intelligence, 76(1):5–23, Feb 2016. ISSN 1573-7470. doi: 10.1007/s10472-015-9463-9.

[9] Couckuyt, I., Deschrijver, D., and Dhaene, T. Towards efficient multiobjective optimization: Multiobjective statistical criterions. In 2012 IEEE Congress on Evolutionary Computation, pp. 1–8, 2012.

[10] Daulton, S., Singh, S., Avadhanula, V., Dimmery, D., and Bakshy, E. Thompson sampling for contextual bandit problems with auxiliary safety constraints. In NeurIPS Workshop on Safety and Robustness in Decision Making, 2019.

[11] Daulton, S., Balandat, M., and Bakshy, E. Differentiable expected hypervolume improvement for parallel multi-objective Bayesian optimization. In Advances in Neural Information Processing Systems 33, NeurIPS, 2020.

[12] Deb, K., Pratap, A., Agarwal, S., and Meyarivan, T. A fast and elitist multiobjective genetic algorithm: Nsga-ii. IEEE Transactions on Evolutionary Computation, 6(2):182–197, 2002.

[13] Deb, K., Thiele, L., Laumanns, M., and Zitzler, E. Scalable multi-objective optimization test problems. volume 1, pp. 825–830, 06 2002. ISBN 0-7803-7282-4. doi: 10.1109/ CEC.2002.1007032.

[14] Deb, K., Gupta, S., Daum, D., Branke, J., Mall, A. K., and Padmanabhan, D. Reliability-based optimization using evolutionary algorithms. IEEE Transactions on Evolutionary Computation, 13(5):1054–1074, 2009. doi: 10.1109/TEVC.2009.2014361.

[15] Dächert, K., Klamroth, K., Lacour, R., and Vanderpooten, D. Efficient computation of the search region in multi-objective optimization. European Journal of Operational Research, 260 (3):841 – 855, 2017.

[16] Emmerich, M. T. M., Giannakoglou, K. C., and Naujoks, B. Single- and multiobjective evolutionary optimization assisted by gaussian random field metamodels. IEEE Transactions on Evolutionary Computation, 10(4):421–439, 2006.

[17] Feng, Q., Letham, B., Bakshy, E., and Mao, H. High-Dimensional Contextual Policy Search with Unknown Context Rewards using Bayesian Optimization. In Advances in Neural Information Processing Systems 33, 2020.

[18] Fisher, M. L., Nemhauser, G. L., and Wolsey, L. A. An analysis of approximations for maximizing submodular set functions—II, pp. 73–87. Springer Berlin Heidelberg, Berlin, Heidelberg, 1978.

[19] Frazier, P. I. A tutorial on bayesian optimization. arXiv preprint arXiv:1807.02811, 2018.

[20] Garrido-Merchán, E. C. and Hernández-Lobato, D. Predictive entropy search for multi-objective bayesian optimization with constraints. Neurocomputing, 361:50–68, 2019.

[21] Garrido-Merchán, E. C. and Hernández-Lobato, D. Parallel predictive entropy search for multi-objective bayesian optimization with constraints, 2020.

[22] Gelbart, M. A., Snoek, J., and Adams, R. P. Bayesian optimization with unknown constraints. In Proceedings of the 30th Conference on Uncertainty in Artificial Intelligence, UAI, 2014.

[23] Golovin, D. and Zhang, Q. Random hypervolume scalarizations for provable multi-objective black box optimization, 2020.

[24] Hernández-Lobato, J. M., Hoffman, M. W., and Ghahramani, Z. Predictive entropy search for efficient global optimization of black-box functions. In Proceedings of the 27th International Conference on Neural Information Processing Systems - Volume 1, NIPS’14, pp. 918–926, Cambridge, MA, USA, 2014. MIT Press.

[25] Hernández-Lobato, D., Hernández-Lobato, J. M., Shah, A., and Adams, R. P. Predictive entropy search for multi-objective bayesian optimization, 2015.

[26] Horn, D., Dagge, M., Sun, X., and Bischl, B. First investigations on noisy model-based multi-objective optimization. volume 10173, pp. 298–313, 02 2017. ISBN 978-3-319-54156-3. doi: 10.1007/978-3-319-54157-0\_21.

[27] Igel, C., Hansen, N., and Roth, S. Covariance matrix adaptation for multi-objective optimization. Evolutionary Computation, 15(1):1–28, 2007. doi: 10.1162/evco.2007.15.1.1.

[28] Jiang, S., Zhang, H., Cong, W., Liang, Z., Ren, Q., Wang, C., Zhang, F., and Jiao, X. Multi-objective optimization of smallholder apple production: Lessons from the bohai bay region. Sustainability, 12(16):6496, 2020.

[29] Jones, D. R., Schonlau, M., and Welch, W. J. Efficient global optimization of expensive black-box functions. Journal of Global Optimization, 13:455–492, 1998.

[30] Kingma, D. P. and Welling, M. Auto-Encoding Variational Bayes. arXiv e-prints, pp. arXiv:1312.6114, Dec 2013.

[31] Klamroth, K., Lacour, R., and Vanderpooten, D. On the representation of the search region in multi-objective optimization. European Journal of Operational Research, 245(3):767–778, Sep 2015. ISSN 0377-2217. doi: 10.1016/j.ejor.2015.03.031. URL [http://dx.doi.org/10.1016/j.ejor.2015.03.031](http://dx.doi.org/10.1016/j.ejor.2015.03.031).

[32] Knowles, J. Parego: a hybrid algorithm with on-line landscape approximation for expensive multiobjective optimization problems. IEEE Transactions on Evolutionary Computation, 10(1): 50–66, 2006.

[33] Koch, P., Wagner, T., Emmerich, M. T., Back, T., and Konen, W. Efficient multi-criteria optimization on noisy machine learning problems. Appl. Soft Comput., 29(C):357–370, April 2015. ISSN 1568-4946. doi: 10.1016/j.asoc.2015.01.005. URL [https://doi.org/10.1016/j.asoc.2015.01.005](https://doi.org/10.1016/j.asoc.2015.01.005).

[34] Lacour, R., Klamroth, K., and Fonseca, C. M. A box decomposition algorithm to compute the hypervolume indicator. Computers & Operations Research, 79:347 – 360, 2017.

[35] LeCun, Y., Cortes, C., and Burges, C. Mnist handwritten digit database. ATT Labs [Online]. Available: http://yann.lecun.com/exdb/mnist, 2, 2010.

[36] Letham, B. and Bakshy, E. Bayesian optimization for policy search via online-offline experimentation. Journal of Machine Learning Research, 20(145):1–30, 2019. URL [http://jmlr.org/papers/v20/18-225.html](http://jmlr.org/papers/v20/18-225.html).

[37] Letham, B., Karrer, B., Ottoni, G., and Bakshy, E. Constrained bayesian optimization with noisy experiments. Bayesian Analysis, 14(2):495–519, 06 2019. doi: 10.1214/18-BA1110.

[38] Liao, T., Wang, G., Yang, B., Lee, R., Pister, K., Levine, S., and Calandra, R. Data-efficient learning of morphology and controller for a microrobot. In 2019 International Conference on Robotics and Automation (ICRA), pp. 2488–2494. IEEE, 2019.

[39] Lukovic, K. M., Tian, Y., and Matusik, W. Diversity-guided multi-objective bayesian optimization with batch evaluations. Advances in Neural Information Processing Systems, 33, 2020.

[40] Mao, H., Chen, S., Dimmery, D., Singh, S., Blaisdell, D., Tian, Y., Alizadeh, M., and Bakshy, E. Real-world video adaptation with reinforcement learning. 2019.

[41] Mao, H., Negi, P., Narayan, A., Wang, H., Yang, J., Wang, H., Marcus, R., Addanki, R., Shirkoohi, M. K., He, S., Nathan, V., Cangialosi, F., Venkatakrishnan, S. B., Weng, W.-H., Han, S.-W., Kraska, T., and Alizadeh, M. Park: An open platform for learning-augmented computer systems. In NeurIPS, 2019.

[42] Mennen, S. M., Alhambra, C., Allen, C. L., Barberis, M., Berritt, S., Brandt, T. A., Campbell, A. D., Castañón, J., Cherney, A. H., Christensen, M., Damon, D. B., Eugenio de Diego, J., García-Cerrada, S., García-Losada, P., Haro, R., Janey, J., Leitch, D. C., Li, L., Liu, F., Lobben, P. C., MacMillan, D. W. C., Magano, J., McInturff, E., Monfette, S., Post, R. J., Schultz, D., Sitter, B. J., Stevens, J. M., Strambeanu, I. I., Twilton, J., Wang, K., and Zajac, M. A. The evolution of high-throughput experimentation in pharmaceutical development and perspectives on the future. Organic Process Research & Development, 23(6):1213–1242, 2019. doi: 10.1021/acs.oprd.9b00140.

[43] Namkoong, H., Daulton, S., and Bakshy, E. Distilled thompson sampling: Practical and efficient thompson sampling via imitation learning. In NeurIPS Offline Reinforcement Learning Workshop, 2020.

[44] Osborne, M. A. Bayesian gaussian processes for sequential prediction, optimisation and quadrature. 2010.

[45] Paria, B., Kandasamy, K., and Póczos, B. A Flexible Multi-Objective Bayesian Optimization Approach using Random Scalarizations. ArXiv e-prints, May 2018.

[46] Rahimi, A. and Recht, B. Random features for large-scale kernel machines. In Proceedings of the 20th International Conference on Neural Information Processing Systems, NIPS’07, pp. 1177–1184, Red Hook, NY, USA, 2007. Curran Associates Inc. ISBN 9781605603520.

[47] Rasmussen, C. E. Gaussian Processes in Machine Learning, pp. 63–71. Springer Berlin Heidelberg, Berlin, Heidelberg, 2004.

[48] Real, E., Aggarwal, A., Huang, Y., and Le, Q. V. Regularized evolution for image classifier architecture search. Proceedings of the AAAI Conference on Artificial Intelligence, 33(01): 4780–4789, Jul. 2019. doi: 10.1609/aaai.v33i01.33014780. URL [https://ojs.aaai.org/index.php/AAAI/article/view/4405](https://ojs.aaai.org/index.php/AAAI/article/view/4405).

[49] Schuster, M. Speech recognition for mobile devices at google. In Zhang, B.-T. and Orgun, M. A. (eds.), PRICAI 2010: Trends in Artificial Intelligence, pp. 8–10, Berlin, Heidelberg, 2010. Springer Berlin Heidelberg. ISBN 978-3-642-15246-7.

[50] Shahriari, B., Swersky, K., Wang, Z., Adams, R. P., and de Freitas, N. Taking the human out of the loop: A review of bayesian optimization. Proceedings of the IEEE, 104(1):148–175, 2016.

[51] Suzuki, S., Takeno, S., Tamura, T., Shitara, K., and Karasuyama, M. Multi-objective Bayesian optimization using pareto-frontier entropy. In III, H. D. and Singh, A. (eds.), Proceedings of the 37th International Conference on Machine Learning, volume 119 of Proceedings of Machine Learning Research, pp. 9279–9288. PMLR, 13–18 Jul 2020. URL [http://proceedings.mlr.press/v119/suzuki20a.html](http://proceedings.mlr.press/v119/suzuki20a.html).

[52] Takeno, S., Fukuoka, H., Tsukada, Y., Koyama, T., Shiga, M., Takeuchi, I., and Karasuyama, M. Multi-fidelity Bayesian optimization with max-value entropy search and its parallelization. In III, H. D. and Singh, A. (eds.), Proceedings of the 37th International Conference on Machine Learning, volume 119 of Proceedings of Machine Learning Research, pp. 9334–9345. PMLR, 13–18 Jul 2020. URL [http://proceedings.mlr.press/v119/takeno20a.html](http://proceedings.mlr.press/v119/takeno20a.html).

[53] Tanabe, R. and Ishibuchi, H. An easy-to-use real-world multi-objective optimization problem suite. Applied Soft Computing, 89:106078, 2020. ISSN 1568-4946. doi: https://doi.org/10.1016/j.asoc.2020.106078.

[54] Thompson, W. R. On the likelihood that one unknown probability exceeds another in view of the evidence of two samples. Biometrika, 25(3/4):285–294, 1933.

[55] Touré, C., Hansen, N., Auger, A., and Brockhoff, D. Uncrowded hypervolume improvement: Como-cma-es and the sofomore framework. In Proceedings of the Genetic and Evolutionary Computation Conference, GECCO ’19, pp. 638–646, New York, NY, USA, 2019. Association for Computing Machinery. ISBN 9781450361118. doi: 10.1145/3321707.3321852. URL [https://doi.org/10.1145/3321707.3321852](https://doi.org/10.1145/3321707.3321852).

[56] Wang, R., Xiong, J., Ishibuchi, H., Wu, G., and Zhang, T. On the effect of reference point in moea/d for multi-objective optimization. Applied Soft Computing, 58:25–34, 2017. ISSN 1568-4946. doi: https://doi.org/10.1016/j.asoc.2017.04.002. URL [https://www.sciencedirect.com/science/article/pii/S1568494617301722](https://www.sciencedirect.com/science/article/pii/S1568494617301722).

[57] Wilson, J., Hutter, F., and Deisenroth, M. Maximizing acquisition functions for bayesian optimization. In Advances in Neural Information Processing Systems 31, pp. 9905–9916. 2018.

[58] Yang, K., Emmerich, M., Deutz, A., and Bäck, T. Multi-objective bayesian global optimization using expected hypervolume improvement gradient. Swarm and Evolutionary Computation, 44: 945 – 956, 2019. ISSN 2210-6502. doi: https://doi.org/10.1016/j.swevo.2018.10.007.

[59] Yang, K., Emmerich, M., Deutz, A. H., and Bäck, T. Efficient computation of expected hypervolume improvement using box decomposition algorithms. CoRR, abs/1904.12672, 2019.

[60] Yang, K., Palar, P., Emmerich, M., Shimoyama, K., and Bäck, T. A multi-point mechanism of expected hypervolume improvement for parallel multi-objective bayesian global optimization. pp. 656–663, 07 2019. doi: 10.1145/3321707.3321784.

[61] Yang, K., Palar, P. S., Emmerich, M., Shimoyama, K., and Bäck, T. A multi-point mechanism of expected hypervolume improvement for parallel multi-objective bayesian global optimization. In Proceedings of the Genetic and Evolutionary Computation Conference, GECCO ’19, pp. 656–663, New York, NY, USA, 2019. Association for Computing Machinery. ISBN 9781450361118. doi: 10.1145/3321707.3321784. URL [https://doi.org/10.1145/3321707.3321784](https://doi.org/10.1145/3321707.3321784).

[62] Youn, B. D., Choi, K., Yang, R.-J., and Gu, L. Reliability-based design optimization for crashworthiness of vehicle side impact. Structural and Multidisciplinary Optimization, 26: 272–283, 02 2004. doi: 10.1007/s00158-003-0345-0.

[63] Zhang, G. and Block, D. E. Using highly efficient nonlinear experimental design methods for optimization of lactococcus lactis fermentation in chemically defined media. Biotechnology progress, 25(6):1587–1597, 2009.

[64] Zhang, Q., Liu, W., Tsang, E., and Virginas, B. Expensive multiobjective optimization by moea/d with gaussian process model. IEEE Transactions on Evolutionary Computation, 14(3): 456–474, 2010. doi: 10.1109/TEVC.2009.2033671.

[65] Zhou, A., Zhang, Q., and Zhang, G. A multiobjective evolutionary algorithm based on decomposition and probability model. In 2012 IEEE Congress on Evolutionary Computation, pp. 1–8, 2012. doi: 10.1109/CEC.2012.6252954.

[66] Zitzler, E., Deb, K., and Thiele, L. Comparison of multiobjective evolutionary algorithms: Empirical results. Evol. Comput., 8(2):173–195, June 2000. ISSN 1063-6560. doi: 10.1162/ 106365600568202. URL [https://doi.org/10.1162/106365600568202](https://doi.org/10.1162/106365600568202).

[67] Zitzler, E., Deb, K., and Thiele, L. Comparison of multiobjective evolutionary algorithms: Empirical results. Evolutionary computation, 8(2):173–195, 2000.

## Appendix to:

# Parallel Bayesian Optimization of Multiple Noisy Objectives with Expected Hypervolume Improvement

## A Potential Societal Impact

Bayesian Optimization specifically aims to increase sample efficiency for hard optimization algorithms, and consequently can help achieve better solutions without incurring large societal costs. For instance, as demonstrated in this work, automotive design problems may be solved much faster, reducing the amount of computationally costly simulations and thus the energy footprint during development. At the same time, improved solutions mean that high crash safety can be achieved with lighter cars, resulting in fewer resources required for their production and, importantly, improving fuel economy of the whole vehicle fleet. Increased robustness to noisy observations further helps reduce the resources spent on evaluating regions of the search space that are not promising. Improvements to the optimization performance and practicality of multi-objective Bayesian optimization have the potential to allow decision makers to better understand and make more informed decisions across multiple trade-offs. We expect these directions to be particularly important as Bayesian optimization is increasingly used for applications such as recommender systems [36], where auxiliary goals such as fairness must be accounted for. Of course, at the end of the day, exactly what objectives decision makers choose to optimize, and how they balance those trade-offs (and whether that is done in equitable fashion) is up to the individuals themselves.

## B Computing Hypervolume Improvement with Box Decompositions

**Definition 3.** For a set of objective vectors $\{ \pmb { f } ( \pmb { x } _ { i } ) \} _ { i = 1 } ^ { q }$ , a reference point $\pmb { r } \in \mathbb { R } ^ { M }$ , and a Pareto frontier $\mathcal { P } ,$ , let $\Delta ( \{ \pmb { f } ( \pmb { x } _ { i } ) \} _ { i = 1 } ^ { q } , \mathcal { P } , \pmb { r } ) \: \subset \: \mathbb { R } ^ { M }$ denote the set of points (1) that are dominated by $\left[ \left\{ \pmb { f } ( \pmb { x } _ { i } ) \right\} _ { i = 1 } ^ { q } ,   ( 2 ) \right.$ that dominate ${ \boldsymbol { r } } ,$ and (3) that are not dominated by $\mathcal { P } .$

Let $\{ S _ { 1 } , . . . , S _ { K } \}$ be a set ofK disjoint axis-aligned rectangles where each $S _ { k }$ is defined by a pair of lower and upper vertices $\pmb { l } _ { k } \in \mathbb { R } ^ { M }$ and $\boldsymbol { u } _ { k } \in \mathbb { R } ^ { \widetilde { M } } \cup \{ \infty \}$ . Figure 5 shows an example decomposition. Such a partitioning allows for efficient piece-wise computation of the hypervolume improvement from a new point $\pmb { f } ( \pmb { x } _ { i } ) \pmb { \bar { } }$ by computing the volume of the intersection of the region dominated exclusively by the new point with $\Delta ( \widetilde { \{ f ( \pmb { x } _ { i } ) } , \pmb { \mathscr { P } } , \pmb { r } ) }$ (and not dominated by the $P )$ with each hyperrectangle $S _ { k }$ Although $\Delta ( \pmb { f } ( \pmb { x } _ { i } ) , \pmb { \mathcal { P } } , \pmb { r } )$ is a non-rectangular polytope, the intersection of $\Delta ( \pmb { f } ( \pmb { x } _ { i } ) , \mathcal { P } , \pmb { r } )$ with each rectangle $S _ { k }$ is a rectangular polytope and the vertices bounding the hyperrectangle corresponding to $\Delta ( \tilde { \pmb { f } } ( \pmb { x } _ { i } ) , \mathcal { P } , \pmb { r } ) \cap S _ { k }$ can be easily computed: the lower bound vertex is $l _ { k }$ and the upper bound vertex is the component-wise minimum of $\pmb { u } _ { k }$ and the new point $\pmb { f } ( \pmb { x } ) \mathrm { : } \; z _ { k } \mathrm { : = m i n } \left[ \pmb { u } _ { k } , \pmb { f } ( \pmb { x } ) \right]$ . The hypervolume improvement can be computed by summing over the volume of $\Delta ( \bar { \pmb { f } ( \pmb { x } _ { i } ) } , \mathcal { P } , \pmb { r } ) \cap S _ { k }$ over all $S _ { k }$

$$
\mathrm { H V I } \big ( \pmb { f } ( \pmb { x } ) , \mathcal { P } \big ) = \sum _ { k = 1 } ^ { K } \mathrm { H V I } _ { k } \big ( \pmb { f } ( \pmb { x } ) , \pmb { l } _ { k } , \pmb { u } _ { k } \big ) = \sum _ { k = 1 } ^ { K } \prod _ { m = 1 } ^ { M } \big [ z _ { k } ^ { ( m ) } - l _ { k } ^ { ( m ) } \big ] _ { + } ,\tag{7}
$$

where $\left[ \cdot \right] _ { \pm }$ denotes the $\operatorname* { m a x } ( \cdot , 0 )$ operation.

![](images/page_15_image_0.jpg)

Figure 5: The hypervolume improvement from a new point $f ( x )$ is shown in blue. The current Pareto frontier $\mathcal { P }$ is given by the green points, the green area is the hypervolume of the Pareto frontier $\mathcal { P }$ given reference point r. The white rectangles $S _ { 1 } , . . . , S _ { k }$ are a disjoint, box decomposition of the non-dominated space that can be used to efficiently compute the hypervolume improvement.

## C qNEHVI under Different Computational Approaches

## C.1 Derivation of IEP formulation of qNEHVI

From (4), the expected noisy joint hypervolume improvement is given by

$$
\hat { \alpha } _ { q \mathrm { N E H V I } } ( \mathcal { X } _ { \mathrm { c a n d } } ) = \frac { 1 } { N } \sum _ { t = 1 } ^ { N } \mathrm { H V I } ( \tilde { \pmb { f } } _ { t } ( \mathcal { X } _ { \mathrm { c a n d } } ) | \mathcal { P } _ { t } )
$$

Recall that the joint HVI formulation under the IEP derived by Daulton et al. [11] is given by

$$
\operatorname { H V I } ( \mathbf { \mathit { f } } ( \mathcal { X } _ { \mathtt { c a n d } } ) | \mathcal { P } ) = \sum _ { k = 1 } ^ { K } \sum _ { j = 1 } ^ { q } \sum _ { X _ { j } \in \mathcal { X } _ { j } } ( - 1 ) ^ { j + 1 } \prod _ { m = 1 } ^ { M } \big [ z _ { k , X _ { j } } ^ { ( m ) } - l _ { k } ^ { ( m ) } \big ] _ { + }\tag{8}
$$

where $\mathcal { X } _ { j }   : =   \{ X _ { j }   \subseteq   \mathcal { X } _ { \mathsf { c a n d } }   :   | X _ { j } |   =   j \}$ and $z _ { k , t , X _ { j } } ^ { ( m ) }   : =   \operatorname* { m i n } [ u _ { k , t } ^ { ( m ) } , f ^ { ( m ) } ( \pmb { x } _ { i _ { 1 } } ) , . . . , f ^ { ( m ) } ( \pmb { x } _ { i _ { j } } ) ]$ for $X _ { j } = \{ \pmb { x } _ { i _ { 1 } } , . . . , \pmb { x } _ { i _ { j } } \}$ . In $q \mathrm { N }$ EHVI, the lower and upper bounds and the number of rectangles in each box decomposition depend $\mathcal { P } _ { t }$ . Hence,

$$
\hat { \alpha } _ { q \operatorname { N E H V I } } ( \mathcal { X } _ { \mathtt { c a n d } } ) = \frac { 1 } { N } \sum _ { t = 1 } ^ { N } \sum _ { k = 1 } ^ { K _ { t } } \sum _ { j = 1 } ^ { q } \sum _ { X _ { j } \in \mathcal { X } _ { j } } ( - 1 ) ^ { j + 1 } \prod _ { m = 1 } ^ { M } \big [ z _ { k , t , X _ { j } } ^ { ( m ) } - l _ { k , t } ^ { ( m ) } \big ] _ { + }
$$

where $z _ { k , t , X _ { j } } ^ { ( m ) } : = \operatorname* { m i n } [ u _ { k , t } ^ { ( m ) } , \tilde { f } _ { t } ^ { ( m ) } ( \mathbf { \mathit { x } } _ { i _ { 1 } } ) , . . . , \tilde { f } _ { t } ^ { ( m ) } ( \mathbf { \mathit { x } } _ { i _ { j } } ) ] \: \mathsf { f o r } \: X _ { j } = \{ \mathbf { \mathit { x } } _ { i _ { 1 } } , . . . , \mathbf { \mathit { x } } _ { i _ { j } } \} .$

## C.2 Derivation of CBD formulation of qNEHVI

Using Definition 2, we rewrite (4) as

$$
\begin{aligned}\hat{\alpha}_{q\mathrm{NEHVI}}(\mathcal{X}_{\mathrm{rand}}) &= \frac{1}{N} \sum_{t=1}^{N} \mathrm{HVI}(\tilde{f}_t(\mathcal{X}_{\mathrm{rand}}) | \mathcal{P}_t) \\&= \frac{1}{N} \sum_{t=1}^{N} \left[ \mathrm{HV}(\tilde{\boldsymbol{f}}(\mathcal{X}_{\mathrm{rand}}) \cup P_t) - \mathrm{HV}(P_t) \right]\end{aligned}
$$

Adding and subtracting $\mathrm { H V } ( \tilde { \pmb { f } } ( \{ \pmb { x } _ { 1 } ) , . . . , \tilde { \pmb { f } } ( x _ { q - 1 } ) \} ) \cup P _ { t } )$ yields

$$
\begin{aligned} { \hat { \alpha } _ { q \operatorname { N E H V I } } ( \mathcal { X } _ { \operatorname { c a n d } } ) = \frac { 1 } { N } \sum _ { t = 1 } ^ { N } \bigg [ } & { { } \operatorname { H V } ( \tilde { \mathbf { \mathit { f } } } ( \mathcal { X } _ { \operatorname { c a n d } } ) \cup P _ { t } ) - \operatorname { H V } ( \tilde { \mathbf { \mathit { f } } } ( \{ \mathbf { \mathit { x } } _ { 1 } ) , . . . , \tilde { \mathbf { \mathit { f } } } ( \mathbf { \mathit { x } } _ { q - 1 } ) \} ) \cup P _ { t } ) } \\ { } & { { } + \operatorname { H V } ( \{ \tilde { \mathbf { \mathit { f } } } ( \mathbf { \mathit { x } } _ { 1 } ) , . . . , \tilde { \mathbf { \mathit { f } } } ( \mathbf { \mathit { x } } _ { q - 1 } ) \} \cup P _ { t } ) - \operatorname { H V } ( P _ { t } ) \bigg ] . } \\ \end{aligned}
$$

Applying Definition 2 again leads to (6):

$$
\begin{align*}\hat{\alpha}_{q\mathrm{NEHVI}}(\mathcal{X}_{\mathrm{rand}}) = \frac{1}{N} & \sum_{t=1}^{N} \mathrm{HVI}(\tilde{\boldsymbol{f}}(\boldsymbol{x}_q) | \{ \tilde{\boldsymbol{f}}(\boldsymbol{x}_1), . . ., \tilde{\boldsymbol{f}}(\boldsymbol{x}_{q-1}) \} \cup P_t) \\& + \frac{1}{N} \sum_{t=1}^{N} \mathrm{HVI}(\{ \tilde{\boldsymbol{f}}(\boldsymbol{x}_1), . . ., \tilde{\boldsymbol{f}}(\boldsymbol{x}_{q-1}) \}) | P_t ).\end{align*}
$$

Note that using the method of common random numbers, the CBD formulation is mathematically equivalent to IEP formulation, but the computing qNEHVI with the CBD trick is much more efficient.

## D Complexity Analysis

## D.1 Complexity of Computing $q \mathbf { N }$ EHVI

In this section we study the complexity of computing the acquisition function. For brevity, we omit the cost of posterior sampling, which is the same for the CBD and IEP approaches.<sup>6</sup>

The CBD approach requires recomputing box decompositions when generating each new candidate. In the worst case, each new candidate is Pareto optimal under the fixed posterior samples, which leads to a time complexity of $O \big ( N ( n + i ) ^ { M } \big )$ for computing the box decompositions in iteration i [59]. Note that there are $O \big ( ( n + \dot { i } ) ^ { M } \big )$ rectangles in each box decomposition. Given box decompositions and posterior samples at the new point, the complexity of computing the acquisition function on a single-threaded machine is $O \big ( \dot { M N } \dot { ( n + i ) ^ { M } } \big )$ Hence, the total time complexity for generating q candidates (ignoring potentially additional time complexity for automated gradient computations) is

$$
O \bigg ( N \sum _ { i = 1 } ^ { q } ( n + i ) ^ { M } \bigg ) + O \bigg ( N _ { \mathsf { o p t } } M N \sum _ { i = 1 } ^ { q } ( n + i ) ^ { M } \bigg ) = O \left( N _ { \mathsf { o p t } } N M ( n + q ) ^ { M } q \right) ,\tag{9}
$$

$$
O \big ( N n ^ { M } \big ) + O \bigg ( N _ { \mathsf { o p t } } M N n ^ { M } \sum _ { i = 1 } ^ { q } 2 ^ { i - 1 } \bigg ) = O \left( N _ { \mathsf { o p t } } N M n ^ { M } 2 ^ { q } q \right) .\tag{10}
$$

The second term on the left hand side in both (9) and (10) is the acquisition optimization complexity, which boils down to $O ( N _ { \mathrm { o p t } } )$ given infinite computing cores because the acquisition computation is completely parallelizable. However, as shown in Figure $^ { 2 , }$ even for relatively small values of q, CPU cores become saturated and GPU memory limits are reached.

Everything else fixed, the asymptotic relative time complexity of using CBD over IEP is therefore $q ^ { - M } \overset { \circ } { 2 ^ { q } } \overset { \circ } { \to } \infty \; \mathrm { a s } \; q \overset { \circ } { \to } \infty$

Similarly, the space complexity under the CBD formulation, $O \big ( M N ( n + q ) ^ { M } \big )$ , is also polynomial in $q ,$ whereas the space complexity is exponential in $q$ under the IEP formulation: $O \left( M N n ^ { M } q 2 ^ { q } \right)$ Everything else fixed, the asymptotic relative complexity (both in terms of time and space) of using CBD over IEP is therefore $\stackrel { \centerdot } { q } \stackrel { \centerdot } { ^ { M } 2 ^ { - q } } \rightarrow 0 \; \mathrm { a s } \; q \rightarrow \stackrel { \centerdot } { \infty }$

## D.2 Efficient Batched Computation

As noted above, using either the IEP or CBD approach, the acquisition computation given the box decompositions is highly parallelizable. However, since the number of hyperrectangles $K _ { t }$ in the box decompoosition can be different under each posterior sample $\tilde { f } _ { t }$ , stacking the box decompositions does not result in a rectangular matrix; the matrix is ragged. In order to leverage modern batched tensor computational paradigms, we pad the box decompositions with empty hyperrectangles $( \mathbf { e . g . }$ $\boldsymbol { l }   =   \mathbf { 0 } , \boldsymbol { u }   \stackrel { \mathrm { ~ \tiny ~ \cdot ~ } } { = }   \mathbf { 0 } )$ such that the box decomposition under every posterior sample contains exactly $K   =   \operatorname* { m a x } _ { t } K _ { t }$ <sub>t</sub> hyperrectangles, which allows us to define a $t \times K$ dimensional matrix of box decompositions for use in batched tensor computation.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">(f( n)| n)</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">O(Mn³)</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">n × n</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">p(f( n, x0, ..., xi)| n)</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">O M i  1 2</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">1  i  q</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">GP</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">M M</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>6</sup>Sampling from p X D incurs a one-time cost of O(Mn ) if each of the M outcomes is modeled by an independent GP, as it involves computing a Cholesky decomposition of the  posterior covariance (at the n observed points) for each. Using low-rank updates of the Cholesky factor to sample from X D has a time complexity of ( (n + − ) ) for ≤ ≤ since each triangular solve has quadratic complexity. Sampling is more costly when using a multi-task model, as it requires a root decomposition of the n × n posterior covariance across data points and tasks.</span></small>

In the 2-objective case, instead of padding the box decomposition, the Pareto frontier under each posterior sample can be padded instead by repeating a point on the Pareto Frontier such that the padded Pareto frontier under every posterior sample has exactly max<sub>t</sub> $\left| \mathcal { P } _ { t } \right|$ points. This enables computing the box decompositions analytically for all posterior samples in parallel using efficient batched computation. The resulting box decompositions all have $K = \operatorname* { m a x } _ { t } | \dot { \mathcal { P } } _ { t } | + 1$ hyperrectangles (some of which may be empty).

## E Theoretical Results

Let $\pmb { x } _ { \mathrm { p r e v } } \in \mathbb { R } ^ { n d }$ denote the stacked set of previously evaluated points in $X _ { n } \colon \pmb { x } _ { \mathrm { p r e v } } : = [ \pmb { x } _ { 1 } ^ { T } , . . . , \pmb { x } _ { n } ^ { T } ] ^ { T }$ Similarly, let $\pmb { x } _ { \mathrm { c a n d } } \in \mathbb { R } ^ { q d }$ denote the stacked set of candidates in $\mathcal { X } _ { \mathrm { c a n d } } \colon \pmb { x } _ { \mathrm { c a n d } } \mathrel { \mathop : } = [ \pmb { x } _ { n + 1 } ^ { T } , . . . , \pmb { x } _ { n + q } ^ { T } ] ^ { T }$ Let $\begin{array} { r } { \tilde { \pmb { f } } _ { t } ( \pmb { x } _ { \mathrm { p r e v } } , \pmb { x } _ { \mathrm { c a n d } } ) : = [ \tilde { \pmb { f } } _ { t } ( \pmb { x } _ { 1 } ) ^ { T } , . . . , \tilde { \pmb { f } } _ { t } ( \pmb { x } _ { n + q } ) ^ { T } ] ^ { T } } \end{array}$ denote the $t ^ { \mathrm { t h } }$ sample of the corresponding objectives, which we write using the parameterization trick as

$$
\begin{array} { r } { \pmb { f } _ { t } ( \pmb { x } _ { \mathrm { p r e v } } , \pmb { x } _ { \mathrm { c a n d } } ) = \mu ( \pmb { x } _ { \mathrm { p r e v } } , \pmb { x } _ { \mathrm { c a n d } } ) + L ( \pmb { x } _ { \mathrm { p r e v } } , \pmb { x } _ { \mathrm { c a n d } } ) \pmb { \zeta } _ { t } , } \end{array}
$$

where $\mu ( \pmb { x } _ { \mathtt { p r e v } } , \pmb { x } _ { \mathtt { c a n d } } ) \quad : \quad \mathbb { R } ^ { ( n + q ) d } \quad \rightarrow \quad \mathbb { R } ^ { ( n + q ) M }$ is the multi-output $\mathbf { G P s }$ posterior mean and $L ( \pmb { x } _ { \mathrm { c a n d } } , \dot { \pmb { x } _ { \mathrm { p r e v } } } ) \in \mathbb { R } ^ { ( n + q ) M \times ( n + q ) M }$ is a root decomposition (often a Cholesky decomposition) of the multi-output $\mathrm { G P s }$ posterior covariance $\Sigma ( \pmb { x } _ { \mathrm { c a n d } } , \pmb { x } _ { \mathrm { p r e v } } ) \in \mathbb { R } ^ { ( n + q ) M \times ( n + q ) M }$ , and $\zeta _ { t } \in \mathbb { R } ^ { ( n + q ) M }$ with $\zeta _ { t } \sim \mathcal { N } ( 0 , I _ { ( n + q ) M } ) .$ <sup>7</sup>

Proof of Theorem $I .$ Since the sequential NEHVI is equivalent to the qNEHVI with $q = 1$ , we prove Theorem 1 for the general $q > 1$ case. Recall from Section C.2, that using the method of common random numbers to fix the base samples, the IEP and CBD formulations are equivalent. Therefore, we proceed only with the IEP formulation for this proof.

We closely follow the proof of Theorem 2 in Daulton et al. [11]. We consider the setting from Balandat et al. [2, Section D.5]. Let $f _ { t } ^ { ( m ) } ( \pmb { x } _ { i } , \pmb { \zeta } _ { t } )   =   S _ { \{ i , m \} } ( \mu ( \pmb { x } _ { \mathrm { c a n d } } , \pmb { x } _ { \mathrm { p r e v } } )   +   L ( \pmb { x } _ { \mathrm { c a n d } } , \pmb { x } _ { \mathrm { p r e v } } ) \pmb { \zeta } _ { t } )$ denote the posterior distribution over the $m ^ { \mathrm { t h } }$ outcome at $x _ { i }$ as a random variable, where $S _ { \{ i , m \} }$ denotes the selection matrix $( \| S _ { \{ i , m \} } \| _ { \infty } \leq 1$ for all $i = 1 , . . . , n + q$ and $m = 1 , . . . , M )$ , to extract the element corresponding to outcome m for the point $x _ { i }$ . The HVI under a single posterior sample is given by

$$
A ( \pmb { x } _ { \mathtt { c a n d } } , \pmb { \zeta } _ { t } ; \pmb { x } _ { \mathtt { p r e v } } ) = \sum _ { k = 1 } ^ { K _ { t } } \sum _ { j = 1 } ^ { q } \sum _ { X _ { j } \in \mathcal { X } _ { j } } ( - 1 ) ^ { j + 1 } \prod _ { m = 1 } ^ { M } \left[ z _ { k , X _ { j } } ^ { ( m ) } ( \pmb { \zeta } _ { t } ) - l _ { k } ^ { ( m ) } \right] _ { + }
$$

where $\mathcal { X } _ { j } \; : = \; \{ X _ { j } \; = \; \{ \mathbf { \mathbf { \mathbf { x } } } _ { i _ { 1 } } , . . . \mathbf { \mathbf { \mathbf { x } } } _ { i _ { j } } \} \; \subseteq \; \mathcal { X } _ { \mathsf { c a n d } } \; : \; | X _ { j } | \; = \; j , n \; + \; 1 \; \leq \; i _ { 1 } \; \leq \; i _ { j } \; \leq \; n \; + \; q \}$ and $z _ { k , X _ { j } } ^ { ( m ) } ( \pmb { \zeta } _ { t } )   =   \operatorname* { m i n } \left[ u _ { k } ^ { ( m ) } , f ^ { ( m ) } ( \pmb { x } _ { i _ { 1 } } , \pmb { \zeta } _ { t } ) , \dots , f ^ { ( m ) } ( \pmb { x } _ { i _ { j } } , \pmb { \zeta } _ { t } ) \right]$ . Note that the box decomposition of the non-dominated space $\{ S _ { 1 } , . . . , S _ { K _ { t } } \}$ and the number of rectangles in the box decomposition depend on $\zeta _ { t } .$ Importantly, the number of hyperrectangles $K _ { t }$ in the decomposition is a finite and bounded by $O ( | \mathcal { P } _ { t } | ^ { \lfloor \frac { M } { 2 } \rfloor + 1 } )$ [34, 59], where $| \mathcal { P } _ { t } | \leq n .$

To satisfy the conditions of [2, Theorem $3 ] ,$ , we need to show that there exists an integrable function $\ell : \mathbb { R } ^ { q \times \check { M } } \mapsto$ R such that for almost every $\zeta _ { t }$ and all $x _ { \mathrm { c a n d } } , y _ { \mathrm { c a n d } } \subseteq \mathcal { X }$

$$
| A ( \pmb { x } _ { \mathtt { c a n d } } , \pmb { \zeta } _ { t } ; \pmb { x } _ { \mathtt { p r e v } } ) - A ( \pmb { y } _ { \mathtt { c a n d } } , \pmb { \zeta } _ { t } ; \pmb { x } _ { \mathtt { p r e v } } ) | \leq \ell ( \pmb { \zeta } _ { t } ) \| \pmb { x } _ { \mathtt { c a n d } } - \pmb { y } _ { \mathtt { c a n d } } \| .\tag{11}
$$

We note that $x _ { \mathrm { p r e v } }$ is fixed and omit $x _ { \mathrm { p r e v } }$ for brevity, except where necessary.

$$
\tilde { a } _ { k , m , j , X _ { j } } ( \mathbf { { x } } _ { \mathtt { c a n d } } , \mathbf { { \zeta } } _ { t } ) : = \left[ \operatorname* { m i n } \big [ u _ { k , t } ^ { ( m ) } , f ^ { ( m ) } ( \mathbf { { x } } _ { i _ { 1 } } , \mathbf { { \zeta } } _ { t } ) , \dots , f ^ { ( m ) } ( \mathbf { { x } } _ { i _ { j } } , \mathbf { { \zeta } } _ { t } ) \big ] - l _ { k , t } ^ { ( m ) } \right] _ { + } .
$$

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">i</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>7</sup>Theorem 1 can be extended to handle non-i d base samples from a family of quasi-Monte Carlo methods as in Balandat et al. [2].</span></small>

Because of linearity, it suffices to show that this condition holds for

$$
\tilde { A } ( \pmb { x } _ { \mathrm { c a n d } } , \pmb { \zeta } _ { t } ) : = \prod _ { m = 1 } ^ { M } \tilde { a } _ { k , m , j , X _ { j } } ( \pmb { x } _ { \mathrm { c a n d } } , \pmb { \zeta } _ { t } ) = \prod _ { m = 1 } ^ { M } \Bigl [ \operatorname* { m i n } \left[ u _ { k , t } ^ { ( m ) } , f ^ { ( m ) } ( \pmb { x } _ { i _ { 1 } } , \pmb { \zeta } _ { t } ) , \dots , f ^ { ( m ) } ( \pmb { x } _ { i _ { j } } , \pmb { \zeta } _ { t } ) \right] - l _ { k , t } ^ { ( m ) } \Bigr ] _ { + }\tag{12}
$$

for all $k , j$ , and $X _ { j }$ . Note that we can bound $\tilde { a } _ { k , m , j , X _ { j } } ( \pmb { x } _ { \mathrm { c a n d } } , \pmb { \zeta } _ { t } )$ by

$$
\begin{aligned} { \tilde { a } _ { k , m , j , X _ { j } } ( \pmb { x } _ { \mathsf { c a n d } } , \pmb { \zeta } _ { t } ) } & { { } \leq \Bigl | \operatorname* { m i n } \left[ u _ { k , t } ^ { ( m ) } , f ^ { ( m ) } ( \pmb { x } _ { i _ { 1 } } , \pmb { \zeta } _ { t } ) , \dots , f ^ { ( m ) } ( \pmb { x } _ { i _ { j } } , \pmb { \zeta } _ { t } ) \right] - l _ { k , t } ^ { ( m ) } \Bigr | } \\ { } & { { } \leq | l _ { k , t } ^ { ( m ) } | + \Bigl | \operatorname* { m i n } \left[ u _ { k , t } ^ { ( m ) } , f ^ { ( m ) } ( \pmb { x } _ { i _ { 1 } } , \pmb { \zeta } _ { t } ) , \dots , f ^ { ( m ) } ( \pmb { x } _ { i _ { j } } , \pmb { \zeta } _ { t } ) \right] \Bigr | . } \\ \end{aligned}\tag{13}
$$

Consider the case where $u _ { k , t } ^ { ( m ) } = \infty$ . Then

$$
\operatorname* { m i n } [ u _ { k , t } ^ { ( m ) } , f ( \pmb { x } _ { i _ { 1 } } , \pmb { \zeta } _ { t } ) ^ { ( m ) } , . . . , f ^ { ( m ) } ( \pmb { x } _ { i _ { j } } , \pmb { \zeta } _ { t } ) ] = \operatorname* { m i n } [ f ^ { ( m ) } ( \pmb { x } _ { i _ { 1 } } , \pmb { \zeta } _ { t } ) , . . . , f ^ { ( m ) } ( \pmb { x } _ { i _ { j } } , \pmb { \zeta } _ { t } ) ] .
$$

Now suppose $u _ { k , t } ^ { ( m ) } < \infty$ . Then

$$
\operatorname* { m i n } [ u _ { k , t } ^ { ( m ) } , f ^ { ( m ) } ( \pmb { x } _ { i _ { 1 } } , \pmb { \zeta } _ { t } ) , . . . f ^ { ( m ) } ( \pmb { x } _ { i _ { j } } , \pmb { \zeta } _ { t } ) ] < \bigl | \operatorname* { m i n } [ f ^ { ( m ) } ( \pmb { x } _ { i _ { 1 } } , \pmb { \zeta } _ { t } ) , . . . f ^ { ( m ) } ( \pmb { x } _ { i _ { j } } , \pmb { \zeta } _ { t } ) ] \bigr | + \bigl | u _ { k , t } ^ { ( m ) } \bigr | .
$$

Let

$$
w_{k,t}^{(m)} = \begin{cases} u_{k,t}^{(m)}, &  if   u_{k,t}^{(m)} < \infty, \\ 0, &  otherwise . \end{cases}
$$

Note tha t l $l _ { k , t } ^ { ( m ) }$ is finite and bounded from above and below by $r ^ { ( m ) } \leq l _ { k , t } ^ { ( m ) } < u _ { k , t } ^ { ( m ) }$ for all $k , t , m$ where $r ^ { ( m ) }$ is the $m ^ { \mathrm { t h } }$ dimension of the reference point.

Hence, we can express the bound in (13) as

$$
\begin{aligned} { \tilde { a } _ { k , m , j , X _ { j } } ( \pmb { x } _ { \mathtt { c a n d } } , \pmb { \zeta } _ { t } ) } & { { } \leq | l _ { k , t } ^ { ( m ) } | + | w _ { k , t } ^ { ( m ) } | + \bigl | \operatorname* { m i n } \big [ f ^ { ( m ) } ( \pmb { x } _ { i _ { 1 } } , \pmb { \zeta } _ { t } ) , \dots , f ^ { ( m ) } ( \pmb { x } _ { i _ { j } } , \pmb { \zeta } _ { t } ) \big ] \bigr | } \\ { } & { { } \leq | l _ { k , t } ^ { ( m ) } | + | w _ { k , t } ^ { ( m ) } | + \sum _ { i _ { 1 } , \dots , i _ { j } } \bigl | f ^ { ( m ) } ( \pmb { x } _ { i _ { j } } , \pmb { \zeta } _ { t } ) \bigr | . } \\ \end{aligned}\tag{14}
$$

Note that we can bound $\textstyle \sum _ { i _ { 1 } , \ldots , i _ { j } } \bigl | f ^ { ( m ) } ( \pmb { x } _ { i _ { j } } , \pmb { \zeta } _ { t } ) \bigr |$ by

$$
\sum _ { i _ { 1 } , \ldots , i _ { j } } \left| f ^ { ( m ) } ( \pmb { x } _ { i _ { j } } , \pmb { \zeta } _ { t } ) \right| \leq | X _ { j } | \big ( \| \mu ^ { ( m ) } ( \pmb { x } _ { \mathsf { c a n d } } , \pmb { x } _ { \mathsf { p r e v } } ) \| + \| L ^ { ( m ) } ( \pmb { x } _ { \mathsf { c a n d } } , \pmb { x } _ { \mathsf { p r e v } } ) \| \| \pmb { \zeta } _ { t } \| \big ) .
$$

Substituting this into (14) yields

$$
| \tilde { a } _ { k , m , j , X _ { j } } ( \pmb { x } _ { \mathrm { c a s d } } , \pmb { \zeta } _ { t } ) | \leq | l _ { k , t } ^ { ( m ) } | + | w _ { k , t } ^ { ( m ) } | + | X _ { j } | \big ( \| \mu ^ { ( m ) } ( \pmb { x } _ { \mathrm { c a s d } } , \pmb { x } _ { \mathrm { p e v } } ) \| + \| L ^ { ( m ) } ( \pmb { x } _ { \mathrm { c a s d } } , \pmb { x } _ { \mathrm { p e v } } ) \| \| \pmb { \zeta } _ { t } \| \big )\tag{15}
$$

for all $k , m , j , X _ { j }$

Because of our assumptions of that X is compact and that the mean and covariance functions are continuously differentiable, $\mu ( \pmb { x } _ { \mathrm { c a n d } } , \pmb { x } _ { \mathrm { p r e v } } ) , L ( \pmb { x } _ { \mathrm { c a n d } } , \pmb { x } _ { \mathrm { p r e v } } ) , \nabla _ { \pmb { x } _ { \mathrm { c a n d } } } \mu ( \pmb { x } _ { \mathrm { c a n d } } , \pmb { x } _ { \mathrm { p r e v } } )$ , and $\nabla _ { \boldsymbol { x } _ { \mathrm { c a n d } } } L ( \boldsymbol { x } _ { \mathrm { c a n d } } , \boldsymbol { x } _ { \mathrm { p r e v } } )$ are uniformly bounded. Hence, there exist ${C_1},{C_2} <$ ∞ such that

$$
| \tilde { a } _ { k , m , j , X _ { j } } ( \pmb { x } _ { \mathtt { c a n d } } , \pmb { \zeta } _ { t } ) | \leq C _ { 1 } + C _ { 2 } \| \pmb { \zeta } _ { t } \|
$$

for all $k , m , j , X _ { j }$

Consider the $M = 2$ case. Omitting the indices $k , t , j , X _ { j }$ for brevity, we have

$$
\begin{aligned} { \big | \tilde { A } ( { { \bf x } } _ { { c o n d } } , \zeta _ { t } ) - } & { { } \tilde { A } ( { { \bf y } } _ { { c o n d } } , \zeta _ { t } ) \big | } \\ { } & { { } = \big | \tilde { a } _ { 1 } ( { { \bf x } } _ { { c o n d } } , \zeta _ { t } ) \tilde { a } _ { 2 } ( { { \bf x } } _ { { c o n d } } , \zeta _ { t } ) - \tilde { a } _ { 1 } ( { { \bf y } } _ { { c o n d } } , \zeta _ { t } ) \tilde { a } _ { 2 } ( { { \bf y } } _ { { c o n d } } , \zeta _ { t } ) \big | } \\ { } & { { } = \big | \tilde { a } _ { 1 } ( { { \bf x } } _ { { c o n d } } , \zeta _ { t } ) \big ( \tilde { a } _ { 2 } ( { { \bf x } } _ { { c o n d } } , \zeta _ { t } ) - \tilde { a } _ { 2 } ( { { \bf y } } _ { { c o n d } } , \zeta _ { t } ) \big ) + \tilde { a } _ { 2 } ( { { \bf y } } _ { { c o n d } } , \zeta _ { t } ) \big ( \tilde { a } _ { 1 } ( { { \bf x } } _ { { c o n d } } , \zeta _ { t } ) - \tilde { a } _ { 1 } ( { { \bf y } } _ { { c o n d } } , \zeta _ { t } ) \big ) \big | } \\ { } & { { } \leq \big | \tilde { a } _ { 1 } ( { { \bf x } } _ { { c o n d } } , \zeta _ { t } ) \big | \big | \tilde { a } _ { 2 } ( { { \bf x } } _ { { c o n d } } , \zeta _ { t } ) - \tilde { a } _ { 2 } ( { { \bf y } } _ { { c o n d } } , \zeta _ { t } ) \big | + \big | \tilde { a } _ { 2 } ( { { \bf y } } _ { { c o n d } } , \zeta _ { t } ) \big | \big | \tilde { a } _ { 1 } ( { { \bf x } } _ { { c o n d } } , \zeta _ { t } ) - \tilde { a } _ { 1 } ( { { \bf y } } _ { { c o n d } } , \zeta _ { t } ) \big | . } \\ { } & { { } \quad ( 1 6 ) } \\ \end{aligned}
$$

Using (15), we can bound $| \tilde { a } _ { k , m , j , X _ { j } } ( \pmb { x } _ { \mathtt { c a n d } } , \pmb { \zeta } _ { t } ) - \tilde { a } _ { k m j X _ { j } } ( \pmb { y } _ { \mathtt { c a n d } } , \pmb { \zeta } _ { t } ) | \; \mathsf { b y }$ y

$$
\begin{aligned} { | \tilde { a } _ { k , t , m , j , X _ { j } } } & { { } ( \mathbf { { x } } _ { \mathsf { c o n d } } , \mathbf { { \zeta } } _ { t } ) - \tilde { a } _ { k , t , m , j , X _ { j } } ( \mathbf { { y } } _ { \mathsf { c o n d } } , \mathbf { { \zeta } } _ { t } ) | } \\ { } & { { } \leq \sum _ { i _ { 1 } , \dots , i _ { j } } | S _ { ( i _ { j } , m ) } ( \mu ( \mathbf { { x } } _ { \mathsf { c o n d } } , \mathbf { { x } } _ { \mathsf { p r e v } } ) + L ( \mathbf { { x } } _ { \mathsf { c o n d } } , \mathbf { { x } } _ { \mathsf { p r e v } } ) \mathbf { { \zeta } } _ { t } ) - S _ { \{ i _ { j } , m \} } ( \mu ( \mathbf { { y } } _ { \mathsf { c o n d } } , \mathbf { { x } } _ { \mathsf { p r e v } } ) + L ( \mathbf { { y } } _ { \mathsf { c o n d } } , \mathbf { { x } } _ { \mathsf { p r e v } } ) \mathbf { { \zeta } } _ { t } ) | } \\ { } & { { } \leq | X _ { j } | \Big ( \| \mu ( \mathbf { { x } } _ { \mathsf { c o n d } } , \mathbf { { x } } _ { \mathsf { p r e v } } ) - \mu ( \mathbf { { y } } _ { \mathsf { c o n d } } , \mathbf { { x } } _ { \mathsf { p r e v } } ) \| + \| L ( \mathbf { { x } } _ { \mathsf { c o n d } } , \mathbf { { x } } _ { \mathsf { p r e v } } ) - L ( \mathbf { { y } } _ { \mathsf { c o n d } } , \mathbf { { x } } _ { \mathsf { p r e v } } ) \| \| \mathbf { { \zeta } } _ { t } \| \Big ) . } \\ \end{aligned}
$$

Since $\mu$ and $L$ have uniformly bounded gradients with respect to $x _ { \mathrm { c a n d } }$ and $\mathbf { \boldsymbol { y } } _ { \mathrm { c a n d } }$ , they are Lipschitz. Therefore, there exist $C _ { 3 } , C _ { 4 } < \infty$ such that

$$
| \tilde { a } _ { k , t , m , j , X _ { j } } ( { { \mathbf { \mathit { x } } } } _ { \mathtt { c a n d } } , { { \mathbf { \zeta } } } _ { t } ) - \tilde { a } _ { k , t , m , j , X _ { j } } ( { { \mathbf { \mathit { y } } } } _ { \mathtt { c a n d } } , { { \mathbf { \zeta } } } _ { t } ) | \leq ( C _ { 3 } + C _ { 4 } \| { { \mathbf { \zeta } } } _ { t } \| ) \| { { \mathbf { \mathit { x } } } } _ { \mathtt { c a n d } } - { { \mathbf { \mathit { y } } } } _ { \mathtt { c a n d } } \|\tag{17}
$$

for all $\pmb { x } _ { \mathrm { c a n d } } , \pmb { y } _ { \mathrm { c a n d } } , k , t , m , j , X _ { j }$

Substituting (17) into (16), we have

$$
\big | \tilde { A } ( { { \mathbf { \mathit { x } } } } _ { \mathtt { c a s d } } , { { \mathbf { \zeta } } } _ { t } ) - \tilde { A } ( { { \mathbf { \mathit { y } } } } _ { \mathtt { c a s d } } , { { \mathbf { \zeta } } } _ { t } ) \big | \leq 2 \Big ( C _ { 1 } C _ { 3 } + ( C _ { 1 } C _ { 4 } + C _ { 2 } C _ { 3 } ) \| { { \mathbf { \zeta } } } _ { t } \| + C _ { 2 } C _ { 4 } \| { { \mathbf { \zeta } } } _ { t } \| ^ { 2 } \Big ) \| { { \mathbf { \mathit { x } } } } _ { \mathtt { c a s d } } - { { \mathbf { \mathit { y } } } } _ { \mathtt { c a s d } } \|
$$

The $M > 2$ is very similar to the $M = 2$ case in (16) albeit with more complex expansions. Similarly, There exist $C <$ ∞ such that

$$
\big | \tilde { A } ( \pmb { x } _ { \mathtt { c a n d } } , \pmb { \zeta } _ { t } ) - \tilde { A } ( \pmb { y } _ { \mathtt { c a n d } } , \pmb { \zeta } _ { t } ) \big | \leq C \sum _ { m = 1 } ^ { M } \| \pmb { \zeta } _ { t } \| ^ { m } \| \pmb { x } _ { \mathtt { c a n d } } - \pmb { y } _ { \mathtt { c a n d } } \|
$$

Let us define $\begin{array} { r } { \ell ( \pmb { \zeta } _ { t } ) : = C \sum _ { m = 1 } ^ { M } \| \pmb { \zeta } _ { t } \| ^ { m } } \end{array}$ . Note that $\ell ( \zeta _ { t } )$ is integrable because all absolute moments exist for the Gaussian distribution. Since this satisfies the criteria for Theorem 3 in Balandat et al. [2], the theorem holds for $q \mathrm { N E H V I } .$ □

## E.1 Unbiased Gradient estimates from the MC formulation

As noted in Section 7, we can show the following (note that this result is not actually required for Theorem 1):

**Proposition 1.** Suppose that the $G P$ mean and covariance function are continuously differentiable. Suppose further that the candidate set $\mathcal { X } _ { c a n d }$ has no duplicates, and that the sample-level gradients $\nabla _ { \pmb { x } } \mathrm { H V I } ( \tilde { f } _ { t } ( \pmb { x } ) )$ are obtained using the reparameterization trick as in Balandat et al. $I 2 J .$ Then

$$
\begin{array} { r } { \mathbb { E } \big [ \nabla _ { \pmb { x } _ { c a n d } } \hat { \alpha } _ { q \mathrm { N E H V I } } ^ { N } ( \pmb { x } _ { c a n d } ) \big ] = \nabla _ { \pmb { x } _ { c a n d } } \alpha _ { q \mathrm { N E H V I } } ( \pmb { x } _ { c a n d } ) , } \end{array}\tag{18}
$$

that $i s ,$ the averaged sample-level gradient is an unbiased estimate of the gradient of the true acquisition function.

The proof of Proposition 1 closely follows the proof of Proposition 1 in Daulton et al. [11].

## F Error Bound on Sequential Greedy Approximation for NEHVI

If the acquisition function $\mathcal { L } ( \mathcal { X } _ { \mathrm { c a n d } } )$ is a normalized (meaning $\mathcal { L } ( \emptyset )   =   0 )$ , monotone, submodular (meaning that the increase in $\dot { \mathcal { L } } ( \mathcal { X } _ { \mathrm { c a n d } } )$ is non-increasing as elements are added to $\mathcal { X } _ { \mathrm { c a n d } }$ set function), then the sequential greedy approximation $\hat { \mathcal { L } }$ of $\mathcal { L }$ enjoys regret of no more than ${ \frac { 1 } { e } } { \mathcal { L } } ^ { * }$ where $\mathcal { L } ^ { * } = \operatorname { m a x } _ { \mathcal { X } _ { \mathsf { c a n d } } \subseteq \mathcal { X } } L ( \mathcal { X } _ { \mathsf { c a n d } } )$ is the optima of $\mathcal { L } \left[ 1 8 \right]$ . We have $\alpha _ { q \mathrm { N E H V I } } ( \mathcal { X } _ { \mathrm { c a n d } } ) = \mathcal { L } ( \mathcal { X } _ { \mathrm { c a n d } } ) =$ $\mathbb { E } _ { \mathcal { P } } \big [ \alpha _ { q \mathrm { E H V I } } ( \mathcal { X } _ { \mathrm { c a n d } } | \mathcal { P } ) \big ]$ . For a fixed, known $\mathcal { P } .$ , Daulton et al. [11] showed that $\alpha _ { q \mathrm { E H V I } }$ is submodular set function. In $\bar { \alpha _ { q \mathrm { N E H V I } } } , \mathcal { P }$ is a stochastic, so $\alpha _ { q \mathrm { E H V I } } ( \mathcal { X } _ { \mathrm { c a n d } } | \mathcal { P } )$ is a stochastic submodular set function. Because the expectation of a stochastic submodular function is submodular [1], $\alpha _ { q \mathrm { N E H V I } }$ is also submodular. Hence, the sequential greedy approximation of $\alpha _ { q \mathrm { N E H V I } }$ enjoys regret of no more than $\scriptstyle { \frac { 1 } { e } } \alpha _ { q \mathrm { N E H V I } } { } ^ { * }$ . Using the result from Wilson et al. [57], the MC-based approximation $\begin{array} { r } { \hat { \alpha } _ { q \mathrm { N E H V I } } ( \mathcal { X } _ { \mathrm { c a n d } } ) = \sum _ { t = 1 } ^ { N } \mathrm { H V I } \big [ \pmb { f } _ { t } ( \mathcal { X } _ { \mathrm { c a n d } } ) | P _ { t } \big ] } \end{array}$ also enjoys the same regret bound because HVI is a normalized submodular set function.<sup>8</sup>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">,</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>8</sup>Submodularity technically requires a finite search space X whereas in BO X is typically an infinite set. Nevertheless in similar scenarios, submodularity has been extended to infinite sets (e.g. Wilson et al. [57]).</span></small>

## G Experiment Setup

## G.1 Implementation / Code used in the experiments

Our implementations of qNEHVI, MESMO, PFES are available in the supplementary files and will be open-sourced under MIT license upon publication. For PESMO, we use the open-source implementation in Spearmint ([https://github.com/HIPS/Spearmint/tree/PESM](https://github.com/HIPS/Spearmint/tree/PESM)), which is licensed by Harvard. For DGEMO, MOEA/D-EGO, and TSEMO we use the open-source implementations available at [https://github.com/yunshengtian/DGEMO/tree/master](https://github.com/yunshengtian/DGEMO/tree/master) under the MIT license. For TS-TCH, qEHVI, and qNParEGO we use the open-source implementations in BoTorch, which are available at [https://github.com/pytorch/botorch)](https://github.com/pytorch/botorch%29) under the MIT license.

For the ABR problem, we use the Park simulator, which is available in open-source at [https://github.com/park-project/park](https://github.com/park-project/park) under the MIT license.

## G.2 Algorithm Details

All methods are initialized with $2 ( d   +   1 )$ points from a scrambled Sobol sequence. All MC acquisition functions uses $N = 1 2 8$ quasi-MC samples [2]. All parallel algorithms using sequential greedy optimization for selecting a batch of candidates points and the base samples are redrawn when selecting candidate $\pmb { x } _ { i } , i = 1 , . . . , q$

For EHVI-based methods, we leverage the two-step trick proposed by [59] to perform efficient box decompositions; (i) we find the set of local lower bounds for the maximization problem using Algorithm 5 from Klamroth et al. [31]<sup>9</sup>, and then (ii) using the local lower bounds as a Pareto frontier for the artificial minimization problem, we compute a box decomposition of the dominated space using Algorithm 1 from Lacour et al. [34].

qEHVI uses the IEP for computing joint EHVI over a set of candidates and computes EHVI with respect to the observed Pareto frontier. qEHVI-PM-CBD uses the Pareto frontier over the posterior means at the previously evaluated points, providing some amount of regularization with respect to the observed values. In addition, qEHVI-PM-CBD uses CBD rather than the IEP, which enables scaling to large batch sizes. qNEHVI-1 uses 500 fourier basis functions.

For PFES and MESMO, we use 10 sampled (approximate) functions using RFFs (with 500 basis functions) and optimize each function using 5000 iterations of NSGA-II [12] with a population size of 50. For PFES, we partition the dominated space under each sampled Pareto frontier using the algorithm proposed Lacour et al. [34], which is more efficient and yields fewer hyperrectangles than the Quick Hypervolume algorithm used by the PFES authors [51]. For qNParEGO, we use a similar pruning strategy to that in qNEHVI to only integrate over the function values of in-sample points that have positive probability of being best with respect to the sampled scalarization. We use the off-the-shelf implementation of qNParEGO in BoTorch [2], which does not use low-rank Cholesky updates; however, we do note that qNPAREGO would likely achieve lower wall times using more efficient linear algebra tricks.

For DGEMO, TSEMO, and MOEA/D-EGO, we use the default settings provided in [https://github.com/yunshengtian/DGEMO/tree/master](https://github.com/yunshengtian/DGEMO/tree/master).

## G.3 Problem Details

All benchmark problems are treated as maximization problems; the objectives for minimization problems are multiplied by -1 to obtain an equivalent maximization problem.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>9</sup>More efficient methods for this step exist (e.g. Dächert et al. [15]), but Klamroth et al. [31] can easily leverage vectorized operations and we find it to be efficient in our experiments.</span></small>

**BraninCurrin** $( M = 2 , \; d = 2 )$ The BraninCurrin problem involves optimizing two competing functions used in BO benchmarks: Branin and Currin. The goal is minimize both:

$$
f ^ { ( 1 ) } ( x _ { 1 } ^ { \prime } , x _ { 2 } ^ { \prime } ) = ( x _ { 2 } - \frac { 5 . 1 } { 4 \pi ^ { 2 } } x _ { 1 } ^ { 2 } + \frac { 5 } { \pi } x _ { 1 } - r ) ^ { 2 } + 1 0 ( 1 - \frac { 1 } { 8 \pi } ) \operatorname { c o s } ( x _ { 1 } ) + 1 0
$$

$$
f ^ { ( 2 ) } ( x _ { 1 } , x _ { 2 } ) = \bigg [ 1 - \operatorname { e x p } \bigg ( - \frac { 1 } { ( 2 x _ { 2 } ) } \bigg ) \bigg ] \frac { 2 3 0 0 x _ { 1 } ^ { 3 } + 1 9 0 0 x _ { 1 } ^ { 2 } + 2 0 9 2 x _ { 1 } + 6 0 } { 1 0 0 x _ { 1 } ^ { 3 } + 5 0 0 x _ { 1 } ^ { 2 } + 4 x _ { 1 } + 2 0 }
$$

where $x _ { 1 } , x _ { 2 } \in [ 0 , 1 ] , x _ { 1 } ^ { \prime } = 1 5 x _ { 1 } - 5 , \operatorname { a n d } x _ { 2 } ^ { \prime } = 1 5 x _ { 2 }$

**DTLZ2** $( M = 2 ,   d = 6 )$ DTLZ2 [13] is a standard problem from the multi-objective optimization literature. The two objectives are

$$
\begin{aligned} { f _ { 1 } ( \mathbf { \mathit { x } } ) } & { { } = ( 1 + g ( \mathbf { \mathit { x } } _ { M } ) ) \operatorname { c o s } \big ( \frac { \pi } { 2 } x _ { 1 } \big ) \cdots \operatorname { c o s } \big ( \frac { \pi } { 2 } x _ { M - 2 } \big ) \operatorname { c o s } \big ( \frac { \pi } { 2 } x _ { M - 1 } \big ) } \\ { f _ { 2 } ( \mathbf { \mathit { x } } ) } & { { } = ( 1 + g ( \mathbf { \mathit { x } } _ { M } ) ) \operatorname { c o s } \big ( \frac { \pi } { 2 } x _ { 1 } \big ) \cdots \operatorname { c o s } \big ( \frac { \pi } { 2 } x _ { M - 2 } \big ) \operatorname { s i n } \big ( \frac { \pi } { 2 } x _ { M - 1 } \big ) , } \\ \end{aligned}
$$

where $\begin{array} { r } { g ( \pmb { x } ) = \sum _ { x _ { i } \in \pmb { x } _ { M } } ( x _ { i } - 0 . 5 ) ^ { 2 } , \pmb { x } \in [ 0 , 1 ] ^ { d } } \end{array}$ , and $x _ { M }$ is the $d - M + 1$ elements of $x .$

**ZDT1** $( M = 2 , \; d = 4 )$ ZDT1 is a benchmark problem from the multi-objective optimization literature [66]. The goal is minimize the following two objectives

$$
\begin{aligned}f^{(1)}(\boldsymbol{x}) &= x_1 \\f^{(2)}(\boldsymbol{x}) &= g(\boldsymbol{x}) \Bigg( 1 - \sqrt{\frac{f^{(1)}(\boldsymbol{x})}{g(\boldsymbol{x})}} \Bigg)\end{aligned}
$$

where $\textstyle g ( \boldsymbol { x } ) = 1 + \frac { 9 } { d - 1 } \sum _ { i = 2 } ^ { d } x _ { i } \; \mathrm { a n d } \; \boldsymbol { x } = [ x _ { 1 } , . . . , x _ { d } ] \in [ 0 , 1 ] ^ { d } .$

VehicleSafety $( M = 3 , \; d = 5 )$ The 3 objectives are based on a response surface model that is fit to data collected from a simulator and are given by [53]:

$$
\begin{aligned} { f _ { 1 } ( \mathbf { \mathit { x } } ) } & { { } = 1 6 4 0 . 2 8 2 3 + 2 . 3 5 7 3 2 8 5 x _ { 1 } + 2 . 3 2 2 0 0 3 5 x _ { 2 } + 4 . 5 6 8 8 7 6 8 x _ { 3 } + 7 . 7 2 1 3 6 3 3 x _ { 4 } + 4 . 4 5 9 5 9 5 0 4 x _ { 5 } } \\ { f _ { 2 } ( \mathbf { \mathit { x } } ) } & { { } = 6 . 5 8 5 6 + 1 . 1 5 x _ { 1 } - 1 . 0 4 2 7 x _ { 2 } + 0 . 9 7 3 8 x _ { 3 } + 0 . 8 3 6 4 x _ { 4 } - 0 . 3 6 9 5 x _ { 1 } x _ { 4 } + 0 . 0 8 6 1 x _ { 1 } x _ { 5 } } \\ { } & { { } \quad + 0 . 3 6 2 8 x _ { 2 } x _ { 4 } + 0 . 1 1 0 6 x _ { 1 } ^ { 2 } - 0 . 3 4 3 7 x _ { 3 } ^ { 2 } + 0 . 1 7 6 4 x _ { 4 } ^ { 2 } } \\ { f _ { 3 } ( \mathbf { \mathit { x } } ) } & { { } = - 0 . 0 5 5 1 + 0 . 0 1 8 1 x _ { 1 } + 0 . 1 0 2 4 x _ { 2 } + 0 . 0 4 2 1 x _ { 3 } - 0 . 0 0 7 3 x _ { 1 } x _ { 2 } + 0 . 0 2 4 x _ { 2 } x _ { 3 } - 0 . 0 1 1 8 x _ { 2 } x _ { 4 } } \\ { } & { { } \quad - 0 . 0 2 0 4 x _ { 3 } x _ { 4 } - 0 . 0 0 8 x _ { 3 } x _ { 5 } - 0 . 0 2 4 1 x _ { 2 } ^ { 2 } + 0 . 0 1 0 9 x _ { 4 } ^ { 2 } } \\ \end{aligned}
$$

where $\pmb { x } \; \in \; [ 1 , 3 ] ^ { 5 }$ We seek to (1) minimize mass (a proxy for fuel efficiency), (2) minimize acceleration (a proxy for passenger trauma) in a full-frontal collision, and (3) minimize the distance that the toe-board intrudes into the cabin (a proxy for vehicle fragility) [53].

AutoML $( M = 2 , \; d = 8 )$ This experiment considers optimizing predictive performance and latency of a deep neural networks (DNN). Practitioners and researchers across many domains use DNNs for recommendation and recognition tasks in low-latency (e.g. on-device) environments [49], where any increase in prediction time degrades the product experience [43]. Simultaneously, researchers are considering increasingly larger architectures that improve predictive performance [48]. Therefore, a firm may be interesting understanding the set of optimal trade-offs between prediction latency and predictive performance. For a demonstration, we consider optimizing $( d = 8 )$ hyperparameters of DNN (detailed in Table 1) to minimize out-of-sample prediction error and minimize latency on the MNIST data set [35]. Using a small randomized test set leads to noisy evaluations of predictive performance and latency measurements are often noisy due to unrelated fluctuations in the testing environment. As in previous works, we minimize a logit transformation of the prediction error and minimize a logarithm of the ratio between the latency of a proposed DNN and the latency of the fastest DNN [20, 21, 25]. For each evaluation, we randomly partition the 60,000 examples from the MNIST training set into a set of 50,000 examples for training and 10,000 examples for evaluation. We train each network for 8 epochs using SGD with momentum with mini-batches of 512 examples. The learning rate is decayed after every 30 mini-batch updates using the specified decay multiplier. We use randomized rounding on the integer parameters before evaluation. For evaluating the performance of different BO methods, we estimate the noiseless objectives using the mean objectives across 3 replications. DNNs are implemented in PyTorch using ReLU activations and a softmax output layer. Latency measurements are taken on a CPU (2x Intel Xeon E5-2680 v4 @ 2.40GHz).

| PARAMETER | SEARCH SPACE |
| --- | --- |
| LEARNING RATE (log<sub>10</sub> SCALE) | [-5.0, -1.0] |
| LEARNING RATE DECAY MULTIPLIER | [0.01, 1.0] |
| DROPOUT RATE | [0.0, 0.7] |
| L<sub>1</sub> REGULARIZATION | [10<sup>-5</sup>, 0.1] |
| L<sub>2</sub> REGULARIZATION | [10<sup>-5</sup>, 0.1] |
| HIDDEN LAYER 1 SIZE | [20, 500] |
| HIDDEN LAYER 2 SIZE | [20, 500] |
| HIDDEN LAYER 3 SIZE | [20, 500] |

Table 1: The search space for the AutoML benchmark.

**CarSideImpact (**M = 4, d = 7) A side-impact test is common practice under European Enhanced Vehicle-Safety Committee to uphold vehicle safety standards [14]. In constrast with the previous VehicleSafety problem where we considered a full-frontal collision, we now consider the problem of tuning parameters controlling the structural design the of an automobile in the case of a side-impact collision. This problem has been widely used in various works and has previously used stochastic parameters to account for manufacturing error [14]. We use the recent 4-objective version proposed by Tanabe & Ishibuchi [53] where the goal to minimize the weight of the vehicle, passenger trauma (pubic force), and vehicle damage (the average velocity of the V-pillar). The fourth objective is a combination of 10 other measures of the vehicle durability and passenger safety (see [14] for details). The mathematical formulas for a response surface model fit to data collected from a simulator are given below:

$$
\begin{aligned} &f^{(1)}(x)=1.98+4.9x_{1}+6.67x_{2}+6.98x_{3}+4.01x_{4}+1.78x_{5}+10^{-5}x_{6}+2.73x_{7}\\ &f^{(2)}(x)=4.72-0.5x_{4}-0.19x_{2}x_{3}\\ &f^{(3)}(x)=0.5(V_{\ttABF}(x)+V_{\ttDE}(x))\\ &f^{(4)}(x)=-\sum_{i=1}^{10}\max[x_{i}(x),0]\\ &\\ &\begin{aligned}\\ &g_{1}(x)=1-1.16+0.3717x_{2}x_{4}+0.0092928x_{3}\\&g_{2}(x)=0.32-0.26+0.1059x_{1}x_{2}+0.06486x_{1}+0.019x_{2}x_{7}-0.0144x_{3}x_{5}-0.015446x_{6}\\&g_{3}(x)=0.32-0.214+0.000717x_{5}-0.045195x_{1}+0.0135168x_{1}-0.03097x_{2}x_{6}\\&g_{4}(x)=0.1082x_{2}x_{7}-0.070717x_{3}-0.032323x_{3}+0.00364x_{5}x_{6}+0.018x_{2}^{2}\\&g_{4}(x)=0.32-0.74+0.6126x_{2}+0.013296x_{3}+0.031872x_{7}-0.227x_{2}^{2}\\&g_{5}(x)=3-23-289.83-0.218x_{3}+0.5071x_{2}x_{1}-2.7296x_{6}+2.6805x_{7}\\&g_{6}(x)=233-33.86-293x_{3}+5.0571x_{1}x_{2}+3.755x_{2}+3.4801x_{7}-1.45728\\&g_{7}(x)=3-46.36+9.9x_{2}x_{4}+4.505x_{1}\\&g_{8}(x)=9.9-V_{\ttV}_{\ttV}_{\ttV}_{\ttV}(x)\\&g_{10}(x)=15.77-V_{\ttV}_{\ttV}(x)\\&V_{\ttMBF}(x)=10.58-0.674x_{1}x_{2}-0.67725x_{2}\\&V_{\ttV}_{\ttV}(x)=16.45-0.489x_{3}x_{7}-0.843x_{5}x_{6}\\ &\end{aligned}\\ \end{aligned}
$$

. The search space is:

$$
\begin{aligned} { x _ { 1 } } & { { } \in [ 0 . 5 , 1 . 5 ] } \\ { x _ { 2 } } & { { } \in [ 0 . 4 5 , 1 . 3 5 ] } \\ { x _ { 3 } , x _ { 4 } } & { { } \in [ 0 . 5 , 1 . 5 ] } \\ { x _ { 5 } } & { { } \in [ 0 . 8 7 5 , 2 . 6 2 5 ] } \\ { x _ { 6 } , x _ { 7 } } & { { } \in [ 0 . 4 , 1 . 2 ] . } \\ \end{aligned}
$$

As in the VehicleSafety problem, we add zero-mean Gaussian noise to each objective with a standard deviation of 1% the range of each objective.

**Constrained BraninCurrin** $( M = 2 , \; V = 2 , \; d = 2 )$ The constrained BraninCurrin problem uses the same objectives as BraninCurrin, but adds the following disk constraint from [22]:

$$
c ( x _ { 1 } ^ { \prime } , x _ { 2 } ^ { \prime } ) = 5 0 - ( x _ { 1 } ^ { \prime } - 2 . 5 ) ^ { 2 } - ( x _ { 2 } ^ { \prime } - 7 . 5 ) ^ { 2 } ) \geq 0
$$

We add zero-mean Gaussian noise to objectives and the constraint slack observations with a standard deviation of 5% of the range of each outcome.

SphereEllipsoidal $( M = 2 , \; d = 5 )$ The SphereEllipsoidal problem is defined over x $: \in [ - 5 , 5 ] ^ { d }$ and the objectives are given by [6]:

$$
\begin{aligned} &f^{(1)}(\boldsymbol{x}) = \sum_{i = 1}^{d}(x_{i} - x_{ opt ,i}^{(1)})^{2} + f_{ opt }^{(1)} \\&f^{(2)}(\boldsymbol{x}) = \sum_{i = 1}^{d}10^{6\frac{i - 1}{d - 1}}z_{i}^{2} + f_{ opt }^{(2)}\\ \end{aligned}
$$

where

$$
\begin{aligned} { z _ { i } } & { { } = T _ { \operatorname { o s z } } ( \delta _ { i } ) } \\ { \delta _ { i } } & { { } = x _ { i } - x _ { \operatorname { o p t } , i } ^ { ( 2 ) } } \\ { T _ { \operatorname { o s z } } ( \delta _ { i } ) } & { { } = \operatorname { s i g n } ( \delta _ { i } ) e ^ { \delta _ { i } + 0 . 0 4 9 \big ( \operatorname { s i n } \big [ c _ { 1 } ( \delta _ { i } ) \hat { \delta _ { i } } \big ] + \operatorname { s i n } \big [ c _ { 2 } ( \delta _ { i } ) \hat { \delta _ { i } } \big ] \big ) } } \\ \end{aligned}
$$

and

$$
\hat { \delta _ { i } } = \left\{ \begin{aligned} { } & { { } \operatorname { l o g } ( | \delta _ { i } | ) , } & { } & { { } \operatorname { i f } \: \delta _ { i } \neq 0 } \\ { } & { { } 0 , } & { } & { { } \operatorname { o t h e r w i s e } } \\ \end{aligned} \right.
$$

$$
c _ { 1 } ( \delta _ { i } ) = \left\{ \begin{matrix} { 1 0 , } & { \mathbf { i f } \: \delta _ { i } \geq 0 } \\ { 5 . 5 , } & { \mathbf { o t h e r w i s e } } \\ \end{matrix} \right.
$$

$$
c _ { 2 } ( \delta _ { i } ) = \left\{ \begin{aligned} { } & { { } 7 . 9 , } & { } & { { } \mathbf { i f } \; \delta _ { i } \geq 0 } \\ { } & { { } 3 . 1 , } & { } & { { } \mathbf { o t h e r w i s e } . } \\ \end{aligned} \right.
$$

We set

$$
\begin{aligned} &\boldsymbol{x}_{\mathrm{opt}}^{(1)}=[-0.0299,2.1458,-3.2922,-2.9438,-1.5406] \\&\boldsymbol{x}_{\mathrm{opt}}^{(2)}=[2.0611,-1.7655,-0.7754,1.8775,-3.7657] \\&f_{\mathrm{opt}}^{(1)}=203.71 \\&f_{\mathrm{opt}}^{(2)}=135.6\\ \end{aligned}
$$

. We add zero-mean Gaussian noise to objectives and the constraint slack observations with a standard deviation of 5% of the range of each outcome.

| PROBLEM | REFERENCE POINT |
| --- | --- |
| BRANINCURRIN | [-18.00, -6.00] |
| ZDT1 | [-1.10, -1.10] |
| DTLZ2 | [-1.10]<sup>M</sup> |
| VEHICLESAFETY | [-1698.55, -11.21, -0.29] |
| ABR | [150.00, -3500.00] |
| AUTOML | [-2.45, 0.60] |
| CARSIDEIMPACT | [-45.49, -4.51, -13.34, -10.39] |
| CONSTRAINEDBRANINCURRIN | [-80.00, -12.00] |
| SPHEREELLIPSOIDAL | [-261.00, -6.77 · 10<sup>6</sup>] |

Table 2: The reference points for each benchmark problem.

## G.4 Evaluation Details

To compute the log hypervolume difference metric, we use NSGA-II to estimate the true Pareto frontier (except for the ABR and AutoML problems, where evaluations are time-consuming and we instead take the true Pareto frontier to be the Pareto frontier across the estimated objectives across all methods and replications). Using this Pareto frontier, we compute the hypervolume dominated by the true Pareto frontier in order to calculate the log hypervolume difference. For ZDT1, the hypervolume dominated by the true Pareto frontier can be computed analytically. For Constrained BraninCurrin, we evaluate the logarithm of the difference between the hypervolume dominated by the true feasible Pareto frontier and the feasible in-sample Pareto frontier for each method.

For all problems, we selected the reference point based on the component-wise noiseless nadir point ${ \pmb f } _ { \mathrm { n a d i r } } ( { \pmb x } )   =   \operatorname* { m i n } _ { { \pmb x } \in { \mathcal X } } { \pmb f } ( { \pmb x } )$ and the range of the Pareto frontier for each noiseless objective using the common heuristic [56]: $\mathbf { r } = \mathbf { f } _ { \mathrm { n a d i r } } ( \mathbf { x } ) - \beta * ( \mathbf { f } _ { \mathrm { i d e a l } } ( \mathbf { x } ) - \mathbf { f } _ { \mathrm { n a d i r } } ( \mathbf { x } ) )$ , where $\beta = \bar { 0 } . 1$ and $\begin{array} { r } { \pmb { f } _ { \mathrm { i d e a l } } ( \pmb { x } ) = \operatorname* { m a x } _ { \pmb { x } \in \mathcal { X } } \pmb { f } ( \pmb { x } ) } \end{array}$

## H Experiments

## H.1 Wall Time Results

Tables 3 and 4 report the acquisition optimization wall times for each method. On all benchmark problems except CarSideImpact, qNEHVI is faster to optimize than MESMO and PFES on a GPU. The wall times for optimizing qNEHVI are competitive with those for qNParEGO on most benchmark problems and batch sizes; on many problems, qNEHVI is often faster than qNParEGO. On the problems VehicleSafety and CarSideImpact problems which have 3 and 4 objectives respectively, we observed tractable wall times, even when generating $q = 3 2$ candidates. The wall time for 3 and 4 objective problems is larger primarily because the box decompositions are more time-consuming to compute and result in more hyperrectangles as the number of objectives increases. Although, $q \mathbf{EHVI}(- \mathbf{PM})$ is faster for $q = 1$ and $q = 8$ on many problems, it is unable to scale to large batch sizes and ran out of memory for $q = 8$ on CarSideImpact due to the box decomposition having a large number of hyperrectangles.

| CPU | BRANINCURRIN | ZDT1 | ABR | VEHICLESAFETY |
| --- | --- | --- | --- | --- |
| MESMO (q=1) | 21.24 (±0.02) | 19.76 (±0.03) | 23.24 (±0.04) | 28.39 (±0.07) |
| PFES (q=1) | 22.86 (±0.05) | 39.82 (±0.14) | 43.03 (±0.12) | 53.16 (±0.17) |
| TS-TCH (q=1) | 0.51 (±0.0) | 0.48 (±0.0) | 0.75 (±0.0) | 0.67 (±0.0) |
| qEHVI-PM-CBD (q=1) | 2.34 (±0.02) | 3.7 (±0.02) | 3.56 (±0.03) | 7.82 (±0.05) |
| qEHVI (q=1) | 0.58 (±0.0) | 0.66 (±0.01) | 2.98 (±0.02) | 5.07 (±0.03) |
| qNEHVI (q=1) | 40.55 (±0.61) | 35.66 (±0.47) | 62.29 (±0.97) | 120.43 (±1.25) |
| qNPAREGO (q=1) | 3.19 (±0.05) | 1.65 (±0.02) | 6.94 (±0.06) | 1.05 (±0.01) |
| qPAREGO (q=1) | 0.58 (±0.01) | 0.7 (±0.01) | 2.5 (±0.03) | 0.75 (±0.01) |
| DGEMO (q=1) | 65.28(±0.26) | 76.99(±0.35) | NA | NA |
| DGEMO (q=8) | 65.44(±0.63) | 86.97(±0.85) | NA | NA |
| DGEMO (q=16) | 66.44(±0.93) | 86.06(±1.21) | NA | NA |
| DGEMO (q=32) | 66.66(±1.47) | 84.66(±1.66) | NA | NA |
| TSEMO (q=1) | 3.02(±0.01) | 2.98(±0.01) | NA | 3.61(±0.01) |
| TSEMO (q=8) | 3.53(±0.01) | 3.48(±0.01) | NA | 7.45(±0.1) |
| TSEMO (q=16) | 3.77(±0.02) | 3.74(±0.02) | NA | 11.06(±0.28) |
| TSEMO (q=32) | 4.29(±0.03) | 4.22(±0.02) | NA | 16.3(±0.68) |
| MOEA/D-EGO (q=1) | 57.79(±0.17) | 58.1(±0.17) | NA | 71.0(±0.21) |
| MOEA/D-EGO (q=8) | 63.56(±0.18) | 63.57(±0.17) | NA | 77.56(±0.22) |
| MOEA/D-EGO (q=16) | 64.0(±0.18) | 63.99(±0.19) | NA | 78.03(±0.25) |
| MOEA/D-EGO (q=32) | 64.09(±0.26) | 63.9(±0.24) | NA | 77.77(±0.35) |

| GPU | BRANINCURRIN | ZDT1 | ABR | VEHICLESAFETY |
| --- | --- | --- | --- | --- |
| MESMO (q=1) | 19.9 (±0.04) | 19.92 (±0.04) | 21.54 (±0.08) | 24.57 (±0.09) |
| PFES (q=1) | 21.68 (±0.07) | 45.9 (±0.17) | 43.3 (±0.13) | 47.25 (±0.16) |
| TS-TCH (q=1) | 0.88 (±0.01) | 0.94 (±0.01) | 1.08 (±0.01) | 1.04 (±0.01) |
| TS-TCH (q=8) | 1.85 (±0.03) | 2.01 (±0.03) | 2.99 (±0.04) | 2.32 (±0.05) |
| TS-TCH (q=16) | 3.08 (±0.08) | 3.29 (±0.1) | 4.28 (±0.08) | 3.54 (±0.09) |
| TS-TCH (q=32) | 5.25 (±0.15) | 5.41 (±0.16) | 7.23 (±0.2) | 6.41 (±0.23) |
| qEHVI-PM-CBD (q=1) | 2.17(±0.01) | 2.12(±0.02) | 3.59(±0.02) | 51.11(±0.28) |
| qEHVI-PM-CBD (q=8) | 39.56(±0.79) | 30.83(±1.35) | 36.2(±0.73) | 716.03(±13.44) |
| qEHVI-PM-CBD (q=16) | 82.91(±2.42) | 67.3(±3.88) | 70.02(±1.64) | 1410.79(±41.72) |
| qEHVI-PM-CBD (q=32) | 147.81(±6.85) | 105.74(±8.55) | 251.97(±12.69) | 2570.95(±116.61) |
| qEHVI (q=1) | 0.72 (±0.01) | 0.99 (±0.02) | 3.67 (±0.02) | 3.96 (±0.05) |
| qEHVI (q=8) | 18.12 (±1.03) | 18.05 (±0.86) | 40.55 (±0.58) | 71.49 (±2.04) |
| qNEHVI (q=1) | 6.15 (±0.06) | 5.75 (±0.04) | 7.72 (±0.09) | 20.81 (±0.11) |
| qNEHVI (q=8) | 48.19 (±1.2) | 46.74 (±0.83) | 49.7 (±0.79) | 168.63 (±2.49) |
| qNEHVI (q=16) | 102.87 (±4.02) | 95.6 (±2.62) | 93.14 (±1.72) | 289.02 (±5.82) |
| qNEHVI (q=32) | 177.56 (±7.81) | 190.59 (±6.07) | 181.97 (±4.77) | 546.83 (±16.09) |
| qNEHVI-1 (q=1) | 0.32(±0.0) | 0.24(±0.0) | 0.56(±0.0) | 0.92(±0.0) |
| qNEHVI-1 (q=8) | 2.43(±0.02) | 2.11(±0.03) | 4.55(±0.06) | 7.1(±0.1) |
| qNEHVI-1 (q=16) | 4.97(±0.07) | 3.73(±0.06) | 8.73(±0.14) | 14.77(±0.31) |
| qNEHVI-1 (q=32) | 9.03(±0.18) | 8.18(±0.24) | 17.15(±0.41) | 34.99(±1.46) |
| qNPAREGO (q=1) | 2.39 (±0.04) | 1.84 (±0.04) | 6.47 (±0.05) | 0.9 (±0.02) |
| qNPAREGO (q=8) | 47.05 (±1.74) | 52.99 (±1.94) | 74.72 (±1.9) | 45.56 (±1.17) |
| qNPAREGO (q=16) | 118.73 (±5.53) | 116.68 (±5.51) | 116.79 (±3.19) | 91.3 (±3.83) |
| qNPAREGO (q=32) | 306.17 (±17.81) | 279.01 (±17.72) | 240.56 (±6.44) | 188.42 (±13.42) |
| qPAREGO (q=1) | 0.81 (±0.02) | 1.05 (±0.03) | 4.39 (±0.05) | 0.79 (±0.02) |
| qPAREGO (q=8) | 13.01 (±0.53) | 16.4 (±0.72) | 31.02 (±0.81) | 12.64 (±0.84) |
| qPAREGO (q=16) | 34.34 (±2.12) | 43.66 (±3.12) | 66.85 (±3.13) | 36.68 (±4.48) |
| qPAREGO (q=32) | 139.73 (±25.22) | 108.25 (±6.94) | 122.37 (±6.12) | 107.34 (±14.76) |

Table 3: Acquisition function optimization wall time (including box decompositions) in seconds on a CPU (2x Intel Xeon E5-2680 v4 @ 2.40GHz) and a Tesla V100 SXM2 GPU (16GB RAM). The mean and two standard errors are reported. DGEMO, TSEMO, and MOEA/D-EGO are omitted for ABR because they have package requirements that are not easily compatible with our distributed evaluation pipeline and ABR evaluations are prohibitively slow without distributed evaluations. DGEMO is omitted for VehicleSafety because the open-source implementation raises an consistently raises an exception in the graph cutting algorithm with this problem.

## H.2 Scaling to large batch sizes with CBD

In Figure 6, we provide results demonstrating the CBD approach enables scaling to large batch sizes, even with 3 or 4 objectives, whereas the IEP wall times grow exponentially with the batch size and the IEP overflows GPU memory even with modest batch sizes.

![](images/page_26_chart_2.jpg)

Figure 6: Acquisition optimization wall time under a sequential greedy approximation using L-BFGS-B for three and four objectives. CBD enables scaling to much larger batch sizes q than using the inclusion-exclusion principle (IEP) and avoids running out-of-memory (OOM) on a GPU. Independent GPs are used for each outcome and are initialized with 20 points from the Pareto frontier of the 6-dimensional DTLZ2 problem [13] with 3 objectives (left) and 4 objectives (right). Wall times were measured on a Tesla V100 SXM2 GPU (16GB GPU RAM) and a Intel Xeon Gold 6138 CPU @ 2GHz CPU (251GB RAM).

## H.3 Additional Empirical Results

The additional optimization performance results in the appendix demonstrate that qNEHVI-based algorithms are consistently the top performer. The only case where qNEHVI(-1) is outperformed is in the sequential setting on the CarSideImpact problem in Figure 9(a), where qEHVI performs best However, as show in Figure 9(b) and Figure 9(c), qNEHVI enables scaling to large batch sizes, whereas qEHVI runs out of memory on a GPU for q = 8. Therefore, in a practical setting where vehicles are manufactured and test in parallel, qNEHVI would be the best choice.

Figure 11 shows that qNEHVI achieves solid performance anytime throughout the learning curve in the sequential setting, and Figure 13 shows that qNEHVI-based variants consistently achieves the best performance for various q with a fixed budget of 224 function evaluations. Although, qNEHVI-1 does not consistently perform better than qNEHVI, qNEHVI-1 achieves very little degradation of sample complexity as the batch size q increases.

## H.4 Better performance from qEHVI with a larger batch size

Interestingly, on many test problems qEHVI performs better with q = 8 than $q   =   1$ . In the case of BraninCurrin and ConstrainedBraninCurrin, qParEGO also improves as q increases. Since this phenomenon is not observed with the noisy acquisition functions (qNEHVI, qNParEGO), we hypothesize that it may be the case that sequential data collection results in a difficult to optimize acquisition surface and that integrating over the in-sample points leads to a smoother acquisition surface that results in improved sequential optimization. The acquisition functions that do not account for noise may be misled by the noise in sequential setting, but using a larger batch size (within limits) may help avoid the issue of not properly accounting for noise.

## H.5 Performance over Higher Dimensional Spaces

qNEHVI-1 relies on approximate GP sample paths (RFFs). Although we find that $q \mathbf { N E H V I - } 1$ performs very well on many low-dimensional problems (see Figure 4), Figures 8 and 7 show that $q \mathrm { N E H V I - 1 }$ does not perform as well a $\mathrm {  ~ i ~ } q \mathrm { N E H V I }$ on higher dimensional problems. We hypothesize that the RFF approximation degrades in higher dimensional search spaces leading to poor optimization performance relative $q \mathrm { N E H V \tilde { I } } ,$ , which uses exact GP samples. It is likely that using 500 Fourier basis functions leads to large approximation error on high dimensional search spaces. Further study is needed to examine whether robust performance can be achieved by increasing the number of basis functions. As shown in Figure 7, qNEHVI consistently outperforms all tested methods regardless of the dimension of the design space.

![](images/page_27_chart_2.jpg)

![](images/page_27_chart_3.jpg)

![](images/page_27_chart_4.jpg)

![](images/page_27_chart_5.jpg)

Figure 7: Sequential optimization performance 2-objective DTLZ2 with $\sigma = 5 \%$ problems as the dimension of the search space increases from $d = 5$ to $d = 2 0$

![](images/page_27_chart_7.jpg)

![](images/page_27_chart_8.jpg)

![](images/page_27_chart_9.jpg)

![](images/page_27_chart_10.jpg)

Figure 8: A comparison of the final optimization performance of qNEHVI-1, a single sample path approximation of $q \mathrm { N E H V I } ,$ and qNEHVI on 2-objective DTLZ2 problems with input dimensions between 5 and 20 under different batch sizes q. qNEHVI-1 is very effective on lower dimensional problems, but does not perform as well as $q \mathrm { N E H V I }$ on higher dimensional problems.

| CPU | DTLZ2 | AUTOML | CARSIDEIMPACT | CONSTRAINED BRANINCURRIN |
| --- | --- | --- | --- | --- |
| MESMO (q=1) | 27.79(±0.07) | 37.86 (±0.08) | 33.31 (±0.06) | NA |
| PFES (q=1) | 69.85(±0.21) | 101.24 (±0.29) | 102.55 (±0.34) | NA |
| TS-TCH (q=1) | 0.72(±0.0) | 0.93 (±0.0) | 1.27 (±0.01) | NA |
| qEHVI-PM-CBD (q=1) | 3.98(±0.02) | 5.76 (±0.05) | 83.14 (±0.74) | 10.27 (±0.06) |
| qEHVI (q=1) | 2.74(±0.01) | 5.05 (±0.04) | 96.19 (±0.9) | 3.26 (±0.05) |
| qNEHVI (q=1) | 54.04(±0.67) | 22.71 (±0.48) | 541.13 (±6.83) | 267.67 (±4.09) |
| qNPAREGO (q=1) | 21.39(±0.2) | 5.6 (±0.07) | 3.38 (±0.05) | 12.05 (±0.17) |
| qPAREGO (q=1) | 2.33(±0.02) | 3.06 (±0.03) | 1.91 (±0.02) | 1.56 (±0.03) |
| DGEMO (q=1) | 84.48(±0.64) | NA | NA | NA |
| DGEMO (q=8) | 65.99(±0.51) | NA | NA | NA |
| DGEMO (q=16) | 69.57(±0.59) | NA | NA | NA |
| DGEMO (q=32) | 72.82(±0.8) | NA | NA | NA |
| TSEMO (q=1) | 3.1(±0.01) | NA | 14.91(±0.16) | NA |
| TSEMO (q=8) | 3.58(±0.01) | NA | 100.78(±3.75) | NA |
| TSEMO (q=16) | 3.87(±0.02) | NA | 188.44(±9.88) | NA |
| TSEMO (q=32) | 4.55(±0.03) | NA | 326.51(±24.03) | NA |
| MOEA/D-EGO (q=1) | 59.3(±0.18) | NA | 79.87(±0.16) | NA |
| MOEA/D-EGO (q=8) | 65.5(±0.18) | NA | 85.34(±0.21) | NA |
| MOEA/D-EGO (q=16) | 65.81(±0.2) | NA | 85.18(±0.3) | NA |
| MOEA/D-EGO (q=32) | 65.44(±0.3) | NA | 84.8(±0.39) | NA |

| GPU | DTLZ2 | AUTOML | CARSIDEIMPACT | CONSTRAINED BRANINCURRIN |
| --- | --- | --- | --- | --- |
| MESMO (q=1) | 17.01(±0.13) | 28.83 (±0.2) | 26.0 (±0.06) | NA |
| PFES (q=1) | 46.63(±0.51) | 85.73 (±0.4) | 55.41 (±0.16) | NA |
| TS-TCH (q=1) | 0.84(±0.01) | 1.49 (±0.01) | 2.17 (±0.01) | NA |
| TS-TCH (q=8) | 3.71(±0.07) | 3.64 (±0.1) | 4.15 (±0.07) | NA |
| TS-TCH (q=16) | 5.85(±0.14) | 6.16 (±0.21) | 6.9 (±0.19) | NA |
| TS-TCH (q=32) | 9.33(±0.3) | 9.47 (±0.47) | 10.2 (±0.4) | NA |
| qEHVI-PM-CBD (q=1) | 4.29(±0.01) | 5.26(±0.05) | 52.7(±0.41) | 15.89(±0.08) |
| qEHVI-PM-CBD (q=8) | 40.85(±0.41) | 39.55(±0.8) | 460.18(±9.76) | 135.89(±1.43) |
| qEHVI-PM-CBD (q=16) | 93.39(±1.87) | 71.8(±1.81) | 866.12(±26.46) | 314.42(±5.44) |
| qEHVI-PM-CBD (q=32) | 194.12(±5.6) | 143.83(±4.88) | 1682.28(±72.5) | 823.01(±24.48) |
| qEHVI (q=1) | 2.93(±0.02) | 4.67 (±0.1) | 9.63 (±0.05) | 5.69 (±0.11) |
| qEHVI (q=8) | 39.64(±0.57) | 104.48 (±1.34) | OOM | 68.95 (±2.57) |
| qNEHVI (q=1) | 4.91(±0.01) | 7.95 (±0.1) | 82.66 (±0.63) | 20.47 (±0.12) |
| qNEHVI (q=8) | 39.96(±0.35) | 67.28 (±1.87) | 683.06 (±13.82) | 168.04 (±1.85) |
| qNEHVI (q=16) | 74.41(±0.63) | 145.66 (±4.45) | 1289.4 (±36.81) | 362.15 (±9.08) |
| qNEHVI (q=32) | 142.18(±1.59) | 247.92 (±11.93) | 2480.41 (±102.38) | 654.66 (±23.48) |
| qNEHVI-1 (q=1) | 0.42(±0.0) | 0.53(±0.0) | 2.11(±0.01) | 1.57(±0.02) |
| qNEHVI-1 (q=8) | 3.26(±0.03) | 4.55(±0.09) | 16.88(±0.2) | 11.01(±0.16) |
| qNEHVI-1 (q=16) | 6.34(±0.04) | 7.22(±0.19) | 34.78(±0.63) | 20.56(±0.4) |
| qNEHVI-1 (q=32) | 14.85(±0.45) | 12.66(±0.54) | 67.27(±1.61) | 40.6(±1.1) |
| qNPAREGO (q=1) | 6.41(±0.03) | 4.86 (±0.1) | 3.25 (±0.06) | 6.17 (±0.07) |
| qNPAREGO (q=8) | 57.17(±0.43) | 48.62 (±1.18) | 30.65 (±0.92) | 38.66 (±0.95) |
| qNPAREGO (q=16) | 114.91(±1.3) | 122.09 (±3.5) | 81.04 (±3.44) | 84.27 (±3.04) |
| qNPAREGO (q=32) | 263.56(±4.03) | 275.41 (±8.29) | 219.98 (±9.75) | 199.6 (±9.68) |
| qPAREGO (q=1) | 2.62(±0.03) | 3.31 (±0.07) | 3.03 (±0.06) | 2.83 (±0.08) |
| qPAREGO (q=8) | 25.75(±0.66) | 33.84 (±1.76) | 22.0 (±0.88) | 20.28 (±1.18) |
| qPAREGO (q=16) | 67.89(±2.27) | 77.25 (±3.9) | 56.09 (±3.09) | 50.06 (±3.84) |
| qPAREGO (q=32) | 159.98(±7.41) | 217.55 (±19.15) | 139.25 (±9.41) | 135.39 (±13.04) |

Table 4: Acquisition function optimization wall time (including box decompositions) in seconds on a CPU (2x Intel Xeon E5-2680 v4 @ 2.40GHz) and a Tesla V100 SXM2 GPU (16GB RAM). The mean and two standard errors are reported. DGEMO, TSEMO, MOEA/D-EGO are omitted for AutoML because they have package requirements that are not easily compatible with our distributed training and evaluation pipeline, and they are omitted for ConstrainedBraninCurrin because they do not support constraints in the open-source implementation at [https://github.com/yunshengtian/DGEMO/tree/master](https://github.com/yunshengtian/DGEMO/tree/master). DGEMO is omitted on CarSideImpact because the open-source implementation does not support more than 3 objectives.

![](images/page_29_chart_0.jpg)

![](images/page_29_chart_1.jpg)

![](images/page_29_chart_2.jpg)

DGEMO MOEA/D-EGO PFES TSEMO qEHVI-PM-CBD qNEHVI-1 MESMO PESMO TS-TCH qEHVI qNEHVI qNParEGO

![](images/page_29_chart_4.jpg)

(a) Sequential Optimization performance on additional benchmark problems.

![](images/page_29_chart_6.jpg)

![](images/page_29_chart_7.jpg)

![](images/page_29_chart_8.jpg)

![](images/page_29_chart_9.jpg)

(b) Parallel optimization performance vs batch iterations (1/2).

![](images/page_29_chart_11.jpg)

![](images/page_29_chart_12.jpg)

![](images/page_29_chart_13.jpg)

![](images/page_29_chart_14.jpg)

(c) Parallel optimization performance vs batch iterations (2/2).

Figure 9: Optimization performance on additional problems. (a) Sequential optimization performance. (b) and (c) Optimization performance of batch acquisition functions using various q over the number of BO iterations. To improve readability, we omit qEHVI(-PM) in this figure because the IEP cannot scale beyond q = 8 because of the exponential time and space complexity (running it on a GPU runs out of memory and running it on a CPU results in prohibitively slow wall times). See Figure 10 for results using qEHVI(-PM).

![](images/page_30_chart_0.jpg)

![](images/page_30_chart_1.jpg)

![](images/page_30_chart_2.jpg)

![](images/page_30_chart_3.jpg)

![](images/page_30_chart_4.jpg)

(a)

![](images/page_30_chart_6.jpg)

![](images/page_30_chart_7.jpg)

![](images/page_30_chart_8.jpg)

(b)

Figure 10: Optimization performance of qNEHVI under various batch sizes q vs qEHVI(-PM). Note that using the IEP, qEHVI(-PM) cannot scale beyond q = 8 because of the exponential time and space complexity (running it on a GPU runs out of memory and running it on a CPU results in prohibitively slow wall times).

![](images/page_31_chart_0.jpg)

![](images/page_31_chart_1.jpg)

![](images/page_31_chart_2.jpg)

$$
\mathrm{qNEHVI~(q=16)}
$$

$$
\mathrm{qNEHVI~(q=32)}
$$

![](images/page_31_chart_5.jpg)

qNParEGO (q=1) qNParEGO (q=16) qNParEGO (q=32) qNParEGO (q=8)

![](images/page_31_chart_7.jpg)

(a)

![](images/page_31_chart_9.jpg)

![](images/page_31_chart_10.jpg)

![](images/page_31_chart_11.jpg)

(b)

Figure 11: Anytime optimization performance of batch acquisition functions using various q over the number of function evaluations. To improve readability, we omit $q \mathrm{EHVI}(- \mathrm{PM})$ in this figure because the IEP cannot scale beyond $q = 8$ because of the exponential time and space complexity (running it on a GPU runs out of memory and running it on a CPU results in prohibitively slow wall times).

![](images/page_32_chart_0.jpg)

![](images/page_32_chart_1.jpg)

![](images/page_32_chart_2.jpg)

![](images/page_32_chart_3.jpg)

![](images/page_32_chart_4.jpg)

(a)

![](images/page_32_chart_6.jpg)

![](images/page_32_chart_7.jpg)

![](images/page_32_chart_8.jpg)

(b)

Figure 12: Anytime optimization performance of batch EHVI-based acquisition functions using various q over the number of function evaluations.

![](images/page_32_chart_11.jpg)

![](images/page_32_chart_12.jpg)

![](images/page_32_chart_13.jpg)

![](images/page_32_chart_14.jpg)

Figure 13: Final log hypervolume difference with various q under a budget of 224 function evaluations. Smaller log hypervolume differences are better.

## H.6 Optimization Performance under Increasing Noise Levels

Figure 14 shows the sequential optimization performance of qNEHVI and qNEHVI-1 relative to qEHVI and qNParEGO under increasing noise levels. qNEHVI-1 achieves the best final hypervolume when the noise standard deviation σ is less than 15% of the range of each objective, but performs worse than qNEHVI earlier in the optimization. qNEHVI is the top performer in high-noise environments. We observe that all methods degrade as the noise level increases, however qNEHVI consistently exhibits excellent performance relative to other methods and only qNEHVI-1 is competitive and only in the low-noise regime.

![](images/page_33_chart_2.jpg)

Figure 14: Sequential optimization performance under increasing noise levels on a DTLZ2 problem $\bar { ( d = 6 ,   M = 2 ) }$ . σ is the noise standard deviation, which we define as a percentage of the range of each objective over the entire search space. A noise level of 20% is very high; for comparison, previous work on noisy MOBO has only considered noise levels of 1% [25].

## H.7 Optimization Performance on Noiseless Benchmarks

We include a comparison of optimization performance on noiseless benchmarks. Figure 15 shows that qNEHVI performs competitively with qEHVI(-PM-CBD) and outperforms DGEMO, TS-TCH and qNParEGO across all benchmark problems. qNEHVI-1 is also a top performer on noiseless problems and both qNEHVI and $q \mathbf { N E H V I - } 1$ show little degradation in performance with increasing levels of parallelism.

![](images/page_34_chart_0.jpg)

![](images/page_34_chart_1.jpg)

![](images/page_34_chart_2.jpg)

(a)

![](images/page_34_chart_4.jpg)

![](images/page_34_chart_5.jpg)

![](images/page_34_chart_6.jpg)

(b)

![](images/page_34_chart_8.jpg)

Figure 15: Sequential (a) and parallel (b) optimization Performance on noiseless benchmarks.

## H.8 Performance of qNEHVI-1 on 5-Objective Optimization

We demonstrate that qNEHVI-1 enables scaling to 5-objective problems. To our knowledge, no previous methods leveraging EHVI or HVI (e.g. DGEMO, TSEMO) considers 5-objective problems because of the super-polynomial complexity of the hypervolume indicator. Nevertheless, we show that using CBD and a single sample path approximation, qNEHVI-1 can be used for 5-objective optimization. As shown in Figure 16, qNEHVI-1 outperforms qNParEGO and Sobol search. qNEHVI-1 takes on average 73.53 seconds (with an SEM of 1.74 seconds) to generate each candidate, whereas qNParEGO takes 11.37 seconds (with an SEM of 0.97 seconds).

![](images/page_34_chart_12.jpg)

Figure 16: Optimization performance on a 5-objective DTLZ2 problem (d = 6) with $\sigma = 5 \%$

## H.9 Performance compared against a Multi-Objective CMA-ES

CMA-ES is an evolutionary strategy that is a strong method in single objective optimization, and many works have proposed extensions of CMA-ES to the multi-objective setting [27, 55]. We compare qNEHVI against the COMO-CMA-ES algorithm, which has been shown to outperform MO-CMA-ES on a variety of problems [55].<sup>10</sup>. We evaluate performance on the SphereEllipsoidal function from Bi-objective Black-Box Optimization Benchmarking Test Suite [6], and we add zero-mean Gaussian noise to each objective with $\sigma = 5 \%$ of the range of each objective. We run COMO-CMA-ES with 5 kernels, the same initial quasi-random design as the BO methods, a population size of 10, and an initial step size of 0.2. As shown in Figure 17, the BO methods vastly outperform COMO-CMA-ES. qNEHVI and qNParEGO perform best and are closely followed by qNEHVI-1.

![](images/page_35_chart_2.jpg)

Figure 17: Optimization performance on a 2-objective Sphere-Ellipsoidal problem $( d = 5 )$ with $\sigma = 5 \%$

## H.10 Importance of Accounting for Noise in DGEMO

![](images/page_35_chart_5.jpg)

![](images/page_35_chart_6.jpg)

![](images/page_35_chart_7.jpg)

Figure 18: An illustration of the effect of noisy observations on the true noiseless Pareto frontiers identified by DGEMO (right) DGEMO-PM-NEHVI (left, see Appendix H.10). Both algorithms are tested on a BraninCurrin synthetic problem, where observations are corrupted with zero-mean, additive Gaussian noise with a standard deviation of 5% of the range of respective objective. All methods use sequential $( q = 1 )$ optimization.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">//gi</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">10<sub>COMO</sub>-<sub>C</sub>MA-ES is also the only multi-objective CMA-ES that we could find with an open-source Python implementation. We use the implementation available at https: thub.com/CMA-ES/pycomocma under the BSD 3-clause license.</span></small>

Similar to EHVI, DGEMO relies on the observed (noisy) Pareto frontier for batch selection. The right plot in Figure 18 shows that DGEMO exhibits the same clumping behavior in objective space in the noisy setting as EHVI. While DGEMO’s diversity constraints (with respect to the input parameters) make it slightly more robust to noise, the solutions are clustered and the bottom right corner of the Pareto frontier is not identified. In an attempt to mitigate these issues, we propose an augmented version of DGEMO, which we call DGEMO-PM-NEHVI, as follows: (i) we use the posterior mean at the previously evaluated points to estimate the in-sample Pareto frontier, which we hope will improve robustness to noise when selecting a discrete set of potential candidates using the DGEMO’s first-order approximation of the Pareto frontier, and (ii) we use $q \mathrm { N E H V I }$ rather than HVI under the posterior mean as the batch selection criterion over the discrete set, subject to DGEMO’s diversity constraints. We find that using qNEHVI to integrate over the uncertainty in the Pareto frontier over the previously evaluated points, results in identifying higher quality Pareto frontiers as shown in Figure 18. We also include DGEMO-PM, which uses (i) but not (ii) for completeness. Not only does DGEMO-PM-NEHVI identify much more diverse solutions that provide better coverage across the Pareto frontier, but DGEMO-PM-NEHVI also identifies much better solutions on the lower right portion of the Pareto frontier than DGEMO and DGEMO-PM. DGEMO-PM performs much better than DGEMO and is competitively with DGEMO-PM-NEHVI, which we speculate is because DGEMO uses a first-order approximation of the Pareto frontier (using the observed values or using the posterior mean for -PM variants) to generate a discrete set of candidates. Using the posterior mean in this step is important for regularizing against extreme observed values due to noise. qNEHVI is only used as a filtering criterion for batch selection over that discrete set of candidates, subject to DGEMO’s diversity constraints. Hence, qNEHVI has limited control over the batch selection procedure.

DGEMO’s first-order approximation fundamentally does not account for uncertainty in the Pareto frontier over previously evaluated points. Although one could integrate over the uncertainty in the in-sample Pareto frontier by generating a first-order approximation of the Pareto frontier under different sample paths, the graph cut algorithm would yield different families under each sample path. It is unclear how to set the diversity constraints in that setting. We leave this for future work.

## I Noisy Outcome Constraints

While the focus of this work is on developing a scalable parallel hypervolume-based acquisition function for noisy settings, our MC-based approach naturally lends itself to support for constraints.

## I.1 Derivation of Constrained NEHVI

The NEHVI formulation in (2) can be extended to handle noisy observations of outcome constraints. We consider the scenario where we receive noisy observations of M objectives $\pmb { f } ( \pmb { x } ) \in \mathbb { R } ^ { M }$ and $V$ constraints $\pmb { c } ^ { ( v ) } \in \mathbb { R } ^ { V }$ , all of which are assumed to be “black-box”: $\mathcal { D } _ { n } = \{ \boldsymbol { x } _ { i } , \boldsymbol { y } _ { i } , \boldsymbol { b } _ { i } \} _ { i = 1 } ^ { n }$ where $\begin{array} { r } { \left[ \begin{matrix} { \pmb { y } _ { i } } \\ { \pmb { b } _ { i } } \end{matrix} \right] \sim \mathcal { N } \bigg ( \left[ \begin{matrix} { \pmb { f } ( \pmb { x } _ { i } ) } \\ { \pmb { c } ( \pmb { x } _ { i } ) } \end{matrix} \right] , \Sigma _ { i } \bigg ) , \; \Sigma _ { i } \in \mathbb { R } ^ { ( M + V ) \times ( M + V ) } } \end{array}$ . We assume, without loss of generality, that $\pmb { c } ^ { ( v ) }$ is feasible iff $\begin{array} { r } { \pmb { c } ^ { ( v ) } \geq 0 . } \end{array}$ . In the constrained optimization setting, we aim to identify the a finite approximate feasible Pareto set

$$
\mathcal { P } _ { \mathrm { f e a s } } = \{ \boldsymbol { f } ( \boldsymbol { x } ) \mid \boldsymbol { x } \in X _ { n } , \boldsymbol { c } ( \boldsymbol { x } ) \geq \mathbf { 0 } , \mathrm { ~ \nexists ~ } \boldsymbol { x } ^ { \prime } : \boldsymbol { c } ( \boldsymbol { x } ^ { \prime } ) \geq \mathbf { 0 } \mathrm { ~ s . t . ~ } \boldsymbol { f } ( \boldsymbol { x } ^ { \prime } ) \succ \boldsymbol { f } ( \boldsymbol { x } ) \}
$$

of the true feasible Pareto set

$$
\mathcal { P } _ { \mathrm { f e a s } } ^ { * } = \{ \boldsymbol { f } ( \boldsymbol { x } ) \quad s . t . \quad \boldsymbol { c } ( \boldsymbol { x } ) \geq \mathbf { 0 } , \quad \nexists \quad \boldsymbol { x } ^ { \prime } : \boldsymbol { c } ( \boldsymbol { x } ^ { \prime } ) \geq \mathbf { 0 } \quad s . t . \quad \boldsymbol { f } ( \boldsymbol { x } ^ { \prime } ) \succ \boldsymbol { f } ( \boldsymbol { x } ) \} .
$$

The natural improvement measure in the constrained setting is feasible HVI, which we define for a single candidate point x as

$$
\mathrm { H V I _ { c } } ( \pmb { f } ( \pmb { x } ) , \pmb { c } ( \pmb { x } ) | \mathcal { P } _ { \mathrm { f e a s } } ) : = \mathrm { H V I } [ \pmb { f } ( \pmb { x } ) | \mathcal { P } _ { \mathrm { f e a s } } ] \cdot \mathbb { 1 } [ \pmb { c } ( \pmb { x } ) \geq \mathbf { 0 } ] .
$$

Taking the expectation over $\mathrm { H V I _ { c } }$ gives the constrained expected hypervolume improvement:

$$
\alpha _ { \mathrm { E H V I _ { c } } } ( \pmb { x } ) = \int \mathrm { H V I _ { c } } ( \pmb { f } ( \pmb { x } ) , \pmb { c } ( \pmb { x } ) | \mathcal { P } _ { \mathrm { f e a s } } ) p ( \pmb { f } , \pmb { c } | \mathcal { D } ) d \pmb { f } d \pmb { c }\tag{19}
$$

For brevity, we define $\mathcal { C } _ { n } = \boldsymbol { c } ( X _ { n } ) , \mathcal { F } _ { n } = \boldsymbol { f } ( X _ { n } )$ . The noisy expected hypervolume improvement is then defined as:

$$
\alpha _ { \operatorname { N E H V I _ { c } } } ( \mathbf { \mathit { x } } ) = \int \alpha _ { \operatorname { E H V I _ { c } } } ( \mathbf { \mathit { x } } | \mathcal { P } _ { \operatorname { f c a s } } ) p ( \mathcal { F } _ { n } , C _ { n } | \mathcal { D } _ { n } ) d \mathcal { F } _ { n } d \mathcal { C } _ { n } .\tag{20}
$$

Performing feasibility-weighting on the sample-level allows us to include such auxiliary outcome constraints into the full Monte Carlo formulation given in (3) in a straightforward way:

$$
\hat { \alpha } _ { \operatorname { N E H V I } c } ( \boldsymbol { x } ) = \frac { 1 } { N } \sum _ { t = 1 } ^ { N } \sum _ { k = 1 } ^ { K _ { t } } \Bigg [ \prod _ { m = 1 } ^ { M } \big [ z _ { k , t } ^ { ( m ) } - l _ { k , t } ^ { ( m ) } \big ] _ { + } \prod _ { v = 1 } ^ { V } \mathbb { 1 } [ c _ { t } ^ { ( v ) } ( \boldsymbol { x } ) \geq 0 ] \Bigg ]
$$

where $z _ { k , t } ^ { ( m ) } : =$ min $\big [ u _ { k , t } ^ { ( m ) } , \tilde { f } _ { t } ^ { ( m ) } ( \pmb { x } ) \big ]$ and $l _ { k , t } ^ { ( m ) } , u _ { k , t } ^ { ( m ) }$ are the $m ^ { \mathrm { t h } }$ dimension of the lower and upper vertices of the rectangle $S _ { k , t }$ in the non-dominated partitioning $\{ S _ { 1 , t } , . . . , S _ { K _ { t } , t } \}$ under the feasible sampled Pareto frontier

$$
\mathcal { P } _ { \mathrm { f e a s } , t } = \mathcal { P } _ { \mathrm { f e a s } } = \{ \tilde { f } _ { t } ( \boldsymbol { x } ) \mid \boldsymbol { x } \in X _ { n } , \tilde { c } _ { t } ( \boldsymbol { x } ) \geq \mathbf { 0 } , \tilde { \# } \boldsymbol { x } ^ { \prime } : \tilde { c } _ { t } ( \boldsymbol { x } ^ { \prime } ) \geq \mathbf { 0 } \text { s . t . } \tilde { f } _ { t } ( \boldsymbol { x } ^ { \prime } ) \succ \tilde { f } _ { t } ( \boldsymbol { x } ) \} .
$$

In this formulation, the $\begin{array} { r } { \prod _ { v = 1 } ^ { V } \mathbb { 1 } [ c _ { t } ^ { ( v ) } ( \pmb { x } ) \geq 0 ] } \end{array}$ indicates feasibility of the t-th sample.

To permit gradient-based optimization via exact sample-path gradients, we replace the indicator function (which is non-differentiable) with a differentiable sigmoid approximation with a temperature parameter τ , which becomes exact as $\tau \to \infty ;$

$$
\mathbb { I } \left[ c ^ { ( v ) } ( \mathbf { \mathit { x } } ) \geq 0 \right] \approx s ( c ^ { ( v ) } ( \mathbf { \mathit { x } } ) ; \tau ) : = \frac { 1 } { 1 + \operatorname { e x p } ( - c ^ { ( v ) } ( \mathbf { \mathit { x } } ) / \tau ) }\tag{21}
$$

Hence,

$$
\hat { \alpha } _ { \operatorname { N E H V I } c } ( \mathbf { \mathit { x } } ) \approx \frac { 1 } { N } \sum _ { t = 1 } ^ { N } \sum _ { k = 1 } ^ { K _ { t } } \Bigg [ \prod _ { m = 1 } ^ { M } \big [ z _ { k , t } ^ { ( m ) } - l _ { k , t } ^ { ( m ) } \big ] _ { + } \prod _ { v = 1 } ^ { V } s ( c _ { t } ^ { ( v ) } ( \mathbf { \mathit { x } } ) , \tau ) \Bigg ]
$$

## I.2 Derivation of Parallel, Constrained NEHVI

The constrained NEHVI can be extended to the parallel setting in a straightforward fashion. The joint constrained hypervolume improvement of a set of points $\{ \pmb { x } _ { i } \} _ { i = 1 } ^ { q }$ is given by

$$
\operatorname { H V I } _ { c } ( \{ \pmb { f } ( \pmb { x } _ { i } ) , \pmb { c } ( \pmb { x } _ { i } ) \} _ { i = 1 } ^ { q } ) = \sum _ { k = 1 } ^ { K } \sum _ { j = 1 } ^ { q } \sum _ { X _ { j } \in \mathcal { X } _ { j } } ( - 1 ) ^ { j + 1 } \Bigg [ \bigg ( \prod _ { m = 1 } ^ { M } \big [ z _ { k , X _ { j } } ^ { ( m ) } { - } l _ { k } ^ { ( m ) } \big ] _ { + } \bigg ) \prod _ { \pmb { x } ^ { \prime } \in X _ { j } } \prod _ { v = 1 } ^ { V } 1 [ c ^ { ( v ) } ( \pmb { x } ^ { \prime } ) \geq 0 ] \Bigg ] .
$$

and the constrained qEHVI is [11]:

$$
\alpha _ { q \mathrm { E H V I _ { c } } } ( \mathcal { X } _ { \mathrm { c a n d } } | \mathcal { P } _ { \mathrm { f e a s } } ) = \int \mathrm { H V I _ { c } } ( \boldsymbol { f } ( \mathcal { X } _ { \mathrm { c a n d } } ) , \boldsymbol { c } ( \mathcal { X } _ { \mathrm { c a n d } } ) | \boldsymbol { P } _ { \mathrm { f e a s } } ) p ( \boldsymbol { f } , \boldsymbol { c } | \mathcal { D } _ { n } ) d \boldsymbol { f } d \boldsymbol { c }
$$

Hence, the constrained qNEHVI is given by:

$$
\begin{aligned} { \alpha _ { q \operatorname { N E H V I } _ { } { c } } ( \mathcal { X } _ { \mathtt { c a n d } } ) } & { { } = \int \alpha _ { q \operatorname { E H V I } _ { \mathtt { C } } } ( \mathcal { X } _ { \mathtt { c a n d } } | \mathcal { P } _ { \mathtt { f e a s } } ) p ( \mathcal { F } _ { n } , C _ { n } | \mathcal { D } _ { n } ) d \mathcal { F } _ { n } d \mathcal { C } _ { n } } \\ { } & { { } = \int \operatorname { H V I } _ { \mathtt { C } } ( \pmb { f } ( \mathcal { X } _ { \mathtt { c a n d } } ) , \pmb { c } ( \mathcal { X } _ { \mathtt { c a n d } } ) | P _ { \mathtt { f e a s } } ) p ( \mathcal { F } _ { n } , C _ { n } | \mathcal { D } _ { n } ) d \mathcal { F } _ { n } d \mathcal { C } _ { n } } \\ \end{aligned}\tag{22}
$$

Using MC integration for the integral in (22), we have

$$
\hat { \alpha } _ { q \mathrm { N E H V I } c } ( \mathcal { X } _ { \mathrm { c a n d } } ) = \frac { 1 } { N } \sum _ { t = 1 } ^ { N } \mathrm { H V I } _ { c } ( \tilde { \pmb { f } } _ { t } ( \mathcal { X } _ { \mathrm { c a n d } } ) , \tilde { \pmb { c } } _ { t } ( \mathcal { X } _ { \mathrm { c a n d } } ) | \mathcal { P } _ { \mathrm { f e a s } , t } ) .\tag{23}
$$

Under the CBD formulation, the constrained qNEHVI is given by

$$
\begin{aligned} { \hat { \alpha } _ { q \operatorname { N E H V I } } ( \{ \mathbf { \mathbf { \mathbf { x } } } _ { 1 } , . . . , \mathbf { \mathbf { \mathbf { x } } } _ { i } \} ) } & { { } = \frac { 1 } { N } \sum _ { t = 1 } ^ { N } \operatorname { H V I _ { C } } ( \{ \tilde { f } _ { t } ( \mathbf { \mathbf { \mathbf { x } } } _ { j } ) , \tilde { \mathbf { \mathbf { c } } } _ { t } ( \mathbf { \mathbf { \mathbf { \mathbf { x } } } } _ { j } ) \} _ { j = 1 } ^ { i - 1 } \} \mid \mathcal { P } _ { \operatorname { f e a s } , t } ) } \\ { } & { { } \qquad + \frac { 1 } { N } \sum _ { t = 1 } ^ { N } \operatorname { H V I _ { C } } ( \tilde { f } _ { t } ( \mathbf { \mathbf { \mathbf { x } } } _ { i } ) , \tilde { \mathbf { \mathbf { c } } } _ { t } ( \mathbf { \mathbf { \mathbf { \mathbf { x } } } } _ { i } ) \mid \mathcal { P } _ { \operatorname { f e a s } , t } \cup \{ \tilde { f } _ { t } ( \mathbf { \mathbf { \mathbf { \mathbf { x } } } } _ { j } ) , \tilde { \mathbf { \mathbf { c } } } _ { t } ( \mathbf { \mathbf { \mathbf { \mathbf { x } } } } _ { j } ) \} _ { j = 1 } ^ { i - 1 } \} ) . } \\ \end{aligned}\tag{24}
$$

As in (6), the first term is a constant when generating candidate i and the second term is the NEHVI of $x _ { i }$

## J Evaluating Methods on Noisy Benchmarks

Given noisy observations, we can no longer compute the true Pareto frontier over the in-sample points $X _ { n }$ . Moreover, the subset of Pareto optimal designs $\mathcal { X } _ { n } ^ { * } = \{ \pmb { x } \in X _ { n } ,   \nexists   \pmb { x } ^ { \prime } \in X _ { n }   s . t .   \pmb { f } ( \pmb { x } ^ { \prime } ) \succ \pmb { \dot { f } } ( \pmb { x } ) \}$ from the previously evaluated points may not be identified due to noise. For the previous results reported in this paper, we evaluate each method according to hypervolume dominated by the true unknown Pareto frontier of the noiseless objectives over the in-sample points. In practice, decisionmakers would often select one of the in-sample points according to their preferences. If the decision maker only has noisy observations, selecting an in-sample point may be preferable to evaluating a new out-of-sample point according to the model’s beliefs. An alternative evaluation method would be use the model’s posterior mean to identify what it believes is the Pareto optimal set of in-sample designs. The hypervolume dominated by the true Pareto frontier of noiseless objectives over that set of selected designs could be computed and used for comparing the performance of different methods. Results using this procedure are shown in Figure 19. The quality of the Pareto set depends on the model fit. Several methods have worse performance over time (e.g. qEHVI and qPAREGO on the ZDT1 problem), likely due to the collection of outlier observations that degrade the model fit. Nevertheless, qNEHVI consistently has the strongest performance.

An alternative to the in-sample evaluation techniques described above would be to use the model to identify the Pareto frontier across the entire search space (in-sample or out-of-sample). For example, Hernández-Lobato et al. [25] used NSGA-II to optimize the model’s posterior mean and identify the model estimated Pareto frontier. For benchmarking purposes on expensive-to-evaluate functions (e.g. in AutoML or ABR), this is prohibitively expensive. Moreover, such a method is less appealing in practice because a decision-maker would have to select out-of-sample points according to the posterior mean and then evaluate a set of preferred designs on the noisy objective to verify that the model predictions are fairly accurate at those out-of-sample designs. Therefore, in this work we evaluate methods based on the in-sample designs.

![](images/page_39_chart_0.jpg)

![](images/page_39_chart_1.jpg)

![](images/page_39_chart_2.jpg)

![](images/page_39_chart_3.jpg)

(a)

![](images/page_39_chart_5.jpg)

![](images/page_39_chart_6.jpg)

(b)

![](images/page_39_chart_8.jpg)

Figure 19: Sequential optimization performance using based on the model-identified Pareto set across in-sample points.