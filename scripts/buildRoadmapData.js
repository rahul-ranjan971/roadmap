import fs from 'fs';
import { roadmap } from '../src/data/roadmap.js';

const quantFocuses = [
  "DCA3108 Unit 1: Quantitative Techniques — Number System basics",
  "DCA3108 Unit 1: Quantitative Techniques — Percentages & Conversions",
  "DCA3108 Unit 1: Quantitative Techniques — Time, Speed & Distance",
  "DCA3108 Unit 1: Quantitative Techniques — Profit, Loss & Discount",
  "DCA3108 Unit 1: Quantitative Techniques — Time & Work / Pipes & Cisterns",
  "DCA3108 Unit 1: Quantitative Techniques — Permutations & Combinations",
  "DCA3108 Unit 1: Quantitative Techniques — Game Based Aptitude",
  "DCA3108 Unit 1: Quantitative Techniques — Vedic Maths for Fast Calculations"
];

const verbFocuses = [
  "DCA3108 Unit 2: Verbal Reasoning — Vocabulary Foundations & Word Roots",
  "DCA3108 Unit 2: Verbal Reasoning — Sentence Construction & Subject-Verb Agreement",
  "DCA3108 Unit 2: Verbal Reasoning — Sentence Improvement & Error Spotting",
  "DCA3108 Unit 2: Verbal Reasoning — Sentence Rearrangement & Comprehension"
];

const logicFocuses = [
  "DCA3108 Unit 3: Logical Reasoning — Number & Letter Series Patterns",
  "DCA3108 Unit 3: Logical Reasoning — Coding-Decoding & Cipher Logic",
  "DCA3108 Unit 3: Logical Reasoning — Blood Relations & Family Tree Deduction",
  "DCA3108 Unit 3: Logical Reasoning — Direction Sense & Path Tracking",
  "DCA3108 Unit 3: Logical Reasoning — Linear & Circular Seating Arrangements",
  "DCA3108 Unit 3: Logical Reasoning — Syllogisms & Deductive Logic",
  "DCA3108 Unit 3: Logical Reasoning — Venn Diagrams & Analytical Puzzle Grids"
];

const gdFocuses = [
  "DCA3108 Unit 4: Interview Preparation — Group Discussion Dynamics & Roles",
  "DCA3108 Unit 4: Interview Preparation — HR Interview Etiquette & Self-Pitch",
  "DCA3108 Unit 4: Interview Preparation — Technical Interview Readiness",
  "DCA3108 Unit 4: Interview Preparation — Body Language & Mock GD Session"
];

const progFocuses = [
  "DCA3108 Unit 5: Programming Basics — C/C++ Control Structures & Pointers Review",
  "DCA3108 Unit 5: Programming Basics — Java Primitives & Memory Model Review"
];

const dca3105Focuses = {
  27: "DCA3105 Unit 1: Introduction to Android Ecosystem & SDK Setup",
  28: "DCA3105 Unit 2: Android Development Environment — Studio, Gradle & Project Structure",
  29: "DCA3105 Unit 2: Android Development Environment — AVD Emulator & Debugging Tools",
  30: "DCA3105 Unit 3: Overview of Threads — UI Thread, Worker Threads & Handlers",
  31: "DCA3105 Unit 3: Overview of Threads — Async Tasks & Concurrency Model",
  32: "DCA3105 Unit 4: Multimedia in Android — Audio Playback & MediaPlayer API",
  33: "DCA3105 Unit 4: Multimedia in Android — VideoView & Camera Intent Basics",
  34: "DCA3105 Unit 5: Android Architecture — Linux Kernel, HAL & Native Libraries",
  35: "DCA3105 Unit 5: Android Architecture — Android Runtime (ART vs Dalvik)",
  36: "DCA3105 Unit 6: Android Software Development Platform — Framework Components",
  37: "DCA3105 Unit 6: Android Software Development Platform — Manifest, Permissions & Resources",
  38: "DCA3105 Unit 7: Android Framework Overview — Activity Lifecycle & State",
  39: "DCA3105 Unit 7: Android Framework Overview — Explicit vs Implicit Intents & Filters",
  40: "DCA3105 Unit 7: Android Framework Overview — Started vs Bound Services",
  41: "DCA3105 Unit 7: Android Framework Overview — Broadcast Receivers & System Events",
  42: "DCA3105 Unit 7: Android Framework Overview — Content Providers & Data Sharing",
  43: "DCA3105 Unit 7: Android Framework Overview — Notifications & Notification Channels",
  44: "DCA3105 Unit 8: Understanding Android Views — View Hierarchy, TextView, Button, EditText",
  45: "DCA3105 Unit 8: Understanding Android Views — ViewGroup, LinearLayout, RelativeLayout, ConstraintLayout",
  46: "DCA3105 Unit 9: Designing Android UI — Styles, Themes & Material Design Components",
  47: "DCA3105 Unit 9: Designing Android UI — RecyclerView, LayoutManager, Adapters & ViewHolders",
  48: "DCA3105 Unit 10: Displaying Pictures in Android — ImageView, Bitmaps & Image Loading",
  49: "DCA3105 Unit 10: Displaying Pictures in Android — Custom Canvas 2D Drawing & Animations",
  50: "DCA3105 Terminal Assessment & Comprehensive Mobile Development Practical Exam"
};

const dca3107Focuses = {
  51: "DCA3107 Unit 1: Introduction to Cloud Computing — NIST Cloud Definition & History",
  52: "DCA3107 Unit 1: Introduction to Cloud Computing — SPI Model: SaaS, PaaS, IaaS",
  53: "DCA3107 Unit 2: Cloud Computing Architectures — Cloud Reference Model & Layers",
  54: "DCA3107 Unit 2: Cloud Computing Architectures — Public, Private, Hybrid & Multi-Cloud",
  55: "DCA3107 Unit 3: Cloud Characteristics & Models — On-Demand Self-Service & Broad Access",
  56: "DCA3107 Unit 3: Cloud Characteristics & Models — Resource Pooling, Elasticity & Metering",
  57: "DCA3107 Unit 4: Technology in Cloud Computing — SOA, Web Services, SOAP vs REST",
  58: "DCA3107 Unit 4: Technology in Cloud Computing — Grid Computing vs Utility Computing vs Cloud",
  59: "DCA3107 Unit 5: Data Centres & Containerisation — Virtual Data Centre & Pod Architecture",
  60: "DCA3107 Unit 5: Data Centres & Containerisation — Containers, Docker Engine vs Hypervisors",
  61: "DCA3107 Unit 6: Compute Virtualisation — Hypervisors: Type-1 Bare-Metal vs Type-2 Hosted",
  62: "DCA3107 Unit 6: Compute Virtualisation — CPU/Memory Virtualisation & P2V Migration",
  63: "DCA3107 Unit 7: Desktop & Application Virtualisation — VDI Architecture & Display Protocols",
  64: "DCA3107 Unit 7: Desktop & Application Virtualisation — Application Sandboxing & Thin Clients",
  65: "DCA3107 Unit 8: Virtualised Data Centre Networking — VLAN, VXLAN & Virtual Switches",
  66: "DCA3107 Unit 8: Virtualised Data Centre Networking — SDN & Cloud Routing Overlays",
  67: "DCA3107 Unit 9: Service Management in Cloud — SLA Management, QoS Metrics & Availability",
  68: "DCA3107 Unit 9: Service Management in Cloud — Capacity Planning, Monitoring & Billing Models",
  69: "DCA3107 Unit 10: Data Management in Cloud — Cloud Storage: Block, File & Object Storage",
  70: "DCA3107 Unit 10: Data Management in Cloud — Distributed Cloud DBs, Replication & Governance",
  71: "DCA3107 Terminal Assessment & Cloud Practical Exam"
};

const dca31e1Focuses = {
  72: "DCA31E1 Unit 1: Introduction to Distributed Systems — Definition, Goals & Transparency",
  73: "DCA31E1 Unit 1: Introduction to Distributed Systems — Hardware/Software Concepts & Models",
  74: "DCA31E1 Unit 2: Basics of DSM — Distributed Shared Memory Architecture & Advantages",
  75: "DCA31E1 Unit 2: Basics of DSM — Page-based, Shared-variable & Object-based DSM",
  76: "DCA31E1 Unit 3: Study of DSM — Strict & Sequential Memory Consistency Models",
  77: "DCA31E1 Unit 3: Study of DSM — Causal, FIFO, Weak & Release Consistency Models",
  78: "DCA31E1 Unit 3: Study of DSM — Page Replacement Algorithms & Thrashing Mitigation",
  79: "DCA31E1 Unit 4: IPC Part 1 — Client-Server Protocols & Socket Communication",
  80: "DCA31E1 Unit 4: IPC Part 1 — Remote Procedure Calls (RPC Model & Client/Server Stubs)",
  81: "DCA31E1 Unit 4: IPC Part 1 — RPC Parameter Marshalling, Call Semantics & Binding",
  82: "DCA31E1 Unit 5: IPC Part 2 — Physical Clock Synchronization (Cristian & Berkeley)",
  83: "DCA31E1 Unit 5: IPC Part 2 — Logical Clocks & Lamport Happened-Before Relation",
  84: "DCA31E1 Unit 5: IPC Part 2 — Vector Clocks & Causal Ordering of Messages",
  85: "DCA31E1 Unit 6: Mutual Exclusion — Centralized & Ricart-Agrawala Distributed Algorithm",
  86: "DCA31E1 Unit 6: Mutual Exclusion — Token Ring & Maekawa Voting Algorithm",
  87: "DCA31E1 Unit 7: Distributed Scheduling — Load Balancing: Sender vs Receiver Initiated",
  88: "DCA31E1 Unit 7: Distributed Scheduling — Process Migration Mechanisms & Performance",
  89: "DCA31E1 Unit 8: Deadlocks Part 1 — Deadlock Handling Strategies & Wait-For Graphs",
  90: "DCA31E1 Unit 8: Deadlocks Part 1 — Centralized Deadlock Detection (Ho-Ramamoorthy)",
  91: "DCA31E1 Unit 9: Deadlocks Part 2 — Distributed Edge-Chasing (Chandy-Misra-Haas)",
  92: "DCA31E1 Unit 9: Deadlocks Part 2 — Hierarchical Deadlock Detection & Resolution",
  93: "DCA31E1 Unit 10: Distributed File Systems — NFS Architecture, VFS & Mount Protocol",
  94: "DCA31E1 Unit 10: Distributed File Systems — NFS Caching & Cache Consistency Semantics",
  95: "DCA31E1 Unit 10: Distributed File Systems — Fault Tolerance, Replication & AFS Architecture",
  96: "DCA31E1 Terminal Assessment & Distributed Systems Mock Exam"
};

const dca3106Focuses = {
  97: "DCA3106 Unit 1: Introduction to Machine Learning — Definition, ML vs Programming",
  98: "DCA3106 Unit 1: Introduction to Machine Learning — Types of ML & Inductive Bias",
  99: "DCA3106 Unit 2: Supervised Learning — Framework, Training/Validation/Testing",
  100: "DCA3106 Unit 2: Supervised Learning — Linear Regression & Gradient Descent",
  101: "DCA3106 Unit 3: K-Nearest Neighbors — Algorithm & Distance Metrics",
  102: "DCA3106 Unit 3: K-Nearest Neighbors — Tuning K, Curse of Dimensionality & KD-Trees",
  103: "DCA3106 Unit 4: Naïve Bayes — Bayes Theorem & Conditional Independence",
  104: "DCA3106 Unit 4: Naïve Bayes — Gaussian, Multinomial & Bernoulli Classifiers",
  105: "DCA3106 Unit 5: Decision Trees — Tree Structure, Entropy, Information Gain & ID3",
  106: "DCA3106 Unit 5: Decision Trees — Gini Impurity, CART Algorithm & Tree Pruning",
  107: "DCA3106 Unit 5: Decision Trees — Overfitting Prevention & Continuous Splits",
  108: "DCA3106 Unit 6: Support Vector Machines — Hyperplanes, Margin & Support Vectors",
  109: "DCA3106 Unit 6: Support Vector Machines — Hard vs Soft Margin & Slack Variables",
  110: "DCA3106 Unit 6: Support Vector Machines — Kernel Trick (Polynomial, RBF, Sigmoid)",
  111: "DCA3106 Unit 6: Support Vector Machines — Multi-Class SVM (OvR vs OvO)",
  112: "DCA3106 Unit 7: Unsupervised Machine Learning — Paradigms & Applications",
  113: "DCA3106 Unit 7: Unsupervised Machine Learning — Dimensionality Reduction & PCA Intuition",
  114: "DCA3106 Unit 7: Unsupervised Machine Learning — PCA Mathematical Formulation & Variance",
  115: "DCA3106 Unit 8: Cluster Analysis — Clustering Fundamentals & Evaluation Metrics",
  116: "DCA3106 Unit 8: Cluster Analysis — Hierarchical Clustering (Agglomerative vs Divisive)",
  117: "DCA3106 Unit 9: Partition-Based Clustering — K-Means Algorithm & Convergence",
  118: "DCA3106 Unit 9: Partition-Based Clustering — K-Means++ & Elbow Method",
  119: "DCA3106 Terminal Assessment & Scikit-Learn Model Practical Exam",
  120: "Master Synthesis, Semester 5 Comprehensive Review & Capstone Integration"
};

const sem5Map = {};
for (let d = 1; d <= 8; d++) sem5Map[d] = { topic: "topic-sem5-dca3108", focus: quantFocuses[d - 1] };
for (let d = 9; d <= 12; d++) sem5Map[d] = { topic: "topic-sem5-dca3108", focus: verbFocuses[d - 9] };
for (let d = 13; d <= 19; d++) sem5Map[d] = { topic: "topic-sem5-dca3108", focus: logicFocuses[d - 13] };
for (let d = 20; d <= 23; d++) sem5Map[d] = { topic: "topic-sem5-dca3108", focus: gdFocuses[d - 20] };
for (let d = 24; d <= 25; d++) sem5Map[d] = { topic: "topic-sem5-dca3108", focus: progFocuses[d - 24] };
sem5Map[26] = { topic: "topic-sem5-dca3108", focus: "DCA3108 Unit 6 Advanced OOP & Unit 7 DBMS/DSA Review — Terminal Mock Exam" };
for (let d = 27; d <= 50; d++) sem5Map[d] = { topic: "topic-sem5-dca3105", focus: dca3105Focuses[d] };
for (let d = 51; d <= 71; d++) sem5Map[d] = { topic: "topic-sem5-dca3107", focus: dca3107Focuses[d] };
for (let d = 72; d <= 96; d++) sem5Map[d] = { topic: "topic-sem5-dca31e1", focus: dca31e1Focuses[d] };
for (let d = 97; d <= 120; d++) sem5Map[d] = { topic: "topic-sem5-dca3106", focus: dca3106Focuses[d] };

// Aptitude focus generator for days 1-120
function getAptitudeFocus(dayNum) {
  if (dayNum <= 30) {
    if (dayNum <= 5) return "Quantitative Aptitude: Number Systems & Arithmetic Primitives";
    if (dayNum <= 10) return "Quantitative Aptitude: Percentages & Successive Changes";
    if (dayNum <= 15) return "Quantitative Aptitude: Profit, Loss, Discount & Market Price";
    if (dayNum <= 20) return "Quantitative Aptitude: Ratios, Proportions & Mixtures";
    if (dayNum <= 25) return "Quantitative Aptitude: Time & Work, Pipes & Cisterns";
    return "Quantitative Aptitude: Time, Speed, Distance, Trains & Boats";
  }
  if (dayNum <= 60) {
    if (dayNum <= 35) return "Logical Reasoning: Number Series, Letter Series & Analogies";
    if (dayNum <= 40) return "Logical Reasoning: Coding-Decoding & Symbol Operations";
    if (dayNum <= 45) return "Logical Reasoning: Blood Relations & Coded Family Trees";
    if (dayNum <= 50) return "Logical Reasoning: Direction Sense, Angles & Distance Tracking";
    if (dayNum <= 55) return "Logical Reasoning: Linear & Circular Seating Arrangements";
    return "Logical Reasoning: Syllogisms, Venn Diagrams & Deductive Logic";
  }
  if (dayNum <= 80) {
    if (dayNum <= 65) return "Verbal Ability: Sentence Correction & Spotting Errors";
    if (dayNum <= 70) return "Verbal Ability: Para-Jumbles & Sentence Rearrangement";
    if (dayNum <= 75) return "Verbal Ability: Vocabulary, Synonyms, Antonyms & Idioms";
    return "Verbal Ability: Reading Comprehension & Critical Inferences";
  }
  if (dayNum <= 100) {
    if (dayNum <= 85) return "Data Interpretation: Tables & Bar Graphs Analysis";
    if (dayNum <= 90) return "Data Interpretation: Pie Charts & Line Graphs Calculations";
    if (dayNum <= 95) return "Analytical Puzzles: Multi-Attribute Scheduling Grids";
    return "Analytical Puzzles: Floor & Box Arrangement Puzzles";
  }
  if (dayNum <= 105) return "Corporate Speed Drills: TCS NQT Placement Aptitude Pattern";
  if (dayNum <= 110) return "Corporate Speed Drills: Infosys & Wipro Placement Pattern";
  if (dayNum <= 115) return "Corporate Speed Drills: Accenture & Cognizant Placement Pattern";
  return "Placement Speed Drills: Product Firm Comprehensive Timed Mocks";
}

const updatedRoadmap = roadmap.map((day) => {
  const dayNum = Number(day.day);
  const dayPad = String(dayNum).padStart(3, '0');
  const sem5Info = sem5Map[dayNum];

  // Update schedule
  const currentSchedule = day.schedule || {};
  const currentMain = currentSchedule.mainTrack || {};
  const currentCore = currentSchedule.coreCS || {};
  const currentDsa = currentSchedule.dsa || {};
  const currentApt = currentSchedule.aptitude || {};
  const currentSide = currentSchedule.sideTrack || {};
  const currentAi = currentSchedule.aiTrack || {};

  const newSchedule = {
    mainTrack: {
      time: "11:30-1:00 & 2:30-4:00",
      topic: currentMain.topic || "topic-javascript",
      focus: currentMain.focus || "Main Placement/Career Track Deep Study",
    },
    aptitude: {
      time: "1:00-1:30",
      topic: currentApt.topic || "topic-aptitude",
      focus: currentApt.focus || getAptitudeFocus(dayNum),
    },
    coreCS: {
      time: "4:15-5:15",
      topic: currentCore.topic || "topic-sql",
      focus: currentCore.focus || "Core CS Foundations",
    },
    dsa: {
      time: "5:15-6:00",
      topic: currentDsa.topic || "topic-cpp",
      focus: currentDsa.focus || "C++ + DSA Problem Solving",
    },
    sem5: {
      time: "6:30-9:00",
      topic: sem5Info.topic,
      focus: sem5Info.focus,
    },
  };

  if (currentSide.topic || currentSide.focus) {
    newSchedule.sideTrack = {
      time: "Inside Main Track",
      topic: currentSide.topic || "topic-python-fundamentals",
      focus: currentSide.focus || "Python companion practice",
    };
  }

  if (currentAi.topic || currentAi.focus) {
    newSchedule.aiTrack = {
      time: "Inside Main Track",
      topic: currentAi.topic || "topic-genai",
      focus: currentAi.focus || "AI companion practice",
    };
  }

  // Update tasks: keep all existing tasks, append sem5 task if not present
  const sem5TaskId = `day-${dayPad}-task-sem5`;
  const tasks = [...day.tasks];
  const hasSem5Task = tasks.some((t) => t.id === sem5TaskId || t.topicId.startsWith('topic-sem5-'));
  if (!hasSem5Task) {
    tasks.push({
      id: sem5TaskId,
      title: `Sem 5: ${sem5Info.focus}`,
      topicId: sem5Info.topic,
      type: "learn",
    });
  }

  return {
    ...day,
    schedule: newSchedule,
    tasks,
  };
});

const fileHeader = `export { bufferDays } from './bufferDays.js';\n\nexport const roadmap = `;
const jsonBody = JSON.stringify(updatedRoadmap, null, 2);
const fileContent = `${fileHeader}${jsonBody};\n`;

fs.writeFileSync('src/data/roadmap.js', fileContent, 'utf-8');
console.log('Successfully wrote updated src/data/roadmap.js!');
