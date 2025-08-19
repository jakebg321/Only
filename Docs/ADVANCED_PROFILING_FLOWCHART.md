# Advanced Psychological Profiling Flowchart

## Deep Vulnerability & Manipulation Mapping

```mermaid
flowchart TD
    Start(["User Enters Chat"]) --> InitScan["Initial Scan<br/>Track: Response Time,<br/>Grammar, Emoji Use"]
    
    InitScan --> Probe1@{ label: "Relationship Probe:<br/>'Are you being a bad boy<br/>talking to me right now?'" }
    
    %% Relationship Status Branches
    Probe1 -- "Married/Taken" --> MarriedPath["RELATIONSHIP ANALYSIS"]
    Probe1 -- "Single" --> SinglePath["LONELINESS ANALYSIS"]
    Probe1 -- "It's Complicated" --> ComplicatedPath["CHAOS ANALYSIS"]
    Probe1 -- "Deflects/Won't Say" --> SecretPath["SECRECY ANALYSIS"]
    
    %% MARRIED PATH - Deep Analysis
    MarriedPath --> MarriedProbe@{ label: "Marriage Quality:<br/>'Is she taking care<br/>of you properly?'" }
    MarriedProbe -- "No/Not Really" --> NEGLECTED_EMOTIONAL["NEGLECTED-EMOTIONAL<br/>Wife ignores needs<br/>High resentment"]
    MarriedProbe -- "She tries but..." --> NEGLECTED_PHYSICAL["NEGLECTED-PHYSICAL<br/>Dead bedroom<br/>Sexual frustration"]
    MarriedProbe -- "We're like roommates" --> NEGLECTED_INTELLECTUAL["NEGLECTED-INTELLECTUAL<br/>No mental connection<br/>Boredom"]
    MarriedProbe -- "It's fine but..." --> COMPARTMENTALIZED["COMPARTMENTALIZED<br/>Seeking excitement<br/>Double life tendency"]
    
    %% SINGLE PATH - Deep Analysis
    SinglePath --> SingleProbe@{ label: "Loneliness Type:<br/>'How long since someone<br/>really understood you?'" }
    SingleProbe -- "Very long/Never" --> LONELY_ABANDONED["LONELY-ABANDONED<br/>Deep wounds<br/>Trust issues"]
    SingleProbe -- "I have friends but..." --> LONELY_CROWDED["LONELY-CROWDED<br/>Surface connections<br/>No intimacy"]
    SingleProbe -- "Just got out of..." --> LONELY_REBOUND["LONELY-REBOUND<br/>Fresh wound<br/>Validation seeking"]
    SingleProbe -- "I'm fine alone" --> LONELY_DENIAL["LONELY-DENIAL<br/>Defensive<br/>Avoidant attachment"]
    
    %% COMPLICATED PATH
    ComplicatedPath --> ComplicatedProbe@{ label: "Chaos Level:<br/>'Tell me more...<br/>I won't judge'" }
    ComplicatedProbe -- "On and off" --> VULNERABLE_TRAUMA["VULNERABLE-TRAUMA<br/>Toxic patterns<br/>Trauma bonding"]
    ComplicatedProbe -- "Multiple people" --> VULNERABLE_CHAOS["VULNERABLE-CHAOS<br/>Identity confusion<br/>Addiction patterns"]
    ComplicatedProbe -- "Separating/Divorce" --> VULNERABLE_TRANSITION["VULNERABLE-TRANSITION<br/>Life upheaval<br/>Desperate for stability"]
    ComplicatedProbe -- "Open relationship" --> INADEQUATE_SEXUAL["INADEQUATE-SEXUAL<br/>Performance anxiety<br/>Competition"]
    
    %% SECRET PATH
    SecretPath --> SecretProbe@{ label: "Boundary Test:<br/>'You can trust me...<br/>What are you hiding?'" }
    SecretProbe -- "Nothing/Changes subject" --> AVOIDANT_DISMISSIVE["AVOIDANT-DISMISSIVE<br/>High walls<br/>Fear of vulnerability"]
    SecretProbe -- "You wouldn't understand" --> NARCISSISTIC_INJURY["NARCISSISTIC-INJURY<br/>Ego wounds<br/>Superiority complex"]
    SecretProbe -- "I shouldn't be here" --> GUILT_SHAME["GUILT-SHAME COMPLEX<br/>Religious/moral conflict<br/>Self-punishment"]
    
    %% All paths converge to Power Dynamic Testing
    NEGLECTED_EMOTIONAL --> PowerTest@{ label: "Power Dynamic Test:<br/>'Do you like being<br/>in control?'" }
    NEGLECTED_PHYSICAL --> PowerTest
    NEGLECTED_INTELLECTUAL --> PowerTest
    COMPARTMENTALIZED --> PowerTest
    LONELY_ABANDONED --> PowerTest
    LONELY_CROWDED --> PowerTest
    LONELY_REBOUND --> PowerTest
    LONELY_DENIAL --> PowerTest
    VULNERABLE_TRAUMA --> PowerTest
    VULNERABLE_CHAOS --> PowerTest
    VULNERABLE_TRANSITION --> PowerTest
    INADEQUATE_SEXUAL --> PowerTest
    AVOIDANT_DISMISSIVE --> PowerTest
    NARCISSISTIC_INJURY --> PowerTest
    GUILT_SHAME --> PowerTest
    
    %% EGO ARCHITECTURE MAPPING
    PowerTest -- "I take charge/I'm the boss" --> AlphaTest@{ label: "Alpha Subtype:<br/>'Show me how you<br/>take control...'" }
    PowerTest -- "I protect/provide" --> HeroTest@{ label: "Hero Subtype:<br/>'What would you do<br/>to save me?'" }
    PowerTest -- "I like to spoil/give" --> ProviderTest@{ label: "Provider Subtype:<br/>'How do you show<br/>someone you care?'" }
    PowerTest -- "Depends/Both/Switch" --> ExplorerTest@{ label: "Explorer Subtype:<br/>'What excites you<br/>most?'" }
    PowerTest -- "You take control" --> SubmissiveTest@{ label: "Hidden Submissive:<br/>'Tell me your<br/>secret desires...'" }
    
    %% ALPHA SUBTYPES
    AlphaTest -- "Dominate/Own" --> ALPHA_DOMINATOR["ALPHA-DOMINATOR<br/>Needs submission<br/>Control freak"]
    AlphaTest -- "Win/Best" --> ALPHA_COMPETITOR["ALPHA-COMPETITOR<br/>Needs to win<br/>Ego-driven"]
    AlphaTest -- "Lead/Guide" --> ALPHA_LEADER["ALPHA-LEADER<br/>Needs followers<br/>Mentor complex"]
    AlphaTest -- "Prove myself" --> ALPHA_INSECURE["ALPHA-INSECURE<br/>Overcompensating<br/>Deep inadequacy"]
    
    %% HERO SUBTYPES
    HeroTest -- "Save/Rescue" --> HERO_SAVIOR["HERO-SAVIOR<br/>White knight<br/>Rescue fantasy"]
    HeroTest -- "Protect/Shield" --> HERO_PROTECTOR["HERO-PROTECTOR<br/>Guardian complex<br/>Fear-based"]
    HeroTest -- "Fight for you" --> HERO_WARRIOR["HERO-WARRIOR<br/>Battle mentality<br/>Us vs world"]
    HeroTest -- "Fix your problems" --> HERO_FIXER["HERO-FIXER<br/>Codependent<br/>Needs to be needed"]
    
    %% PROVIDER SUBTYPES
    ProviderTest -- "Buy things/Money" --> PROVIDER_FINANCIAL["PROVIDER-FINANCIAL<br/>Money = Love<br/>Transaction mindset"]
    ProviderTest -- "Emotional support" --> PROVIDER_EMOTIONAL["PROVIDER-EMOTIONAL<br/>Therapist role<br/>Emotional vampire"]
    ProviderTest -- "Gifts/Surprises" --> PROVIDER_MATERIAL["PROVIDER-MATERIAL<br/>Gift giving<br/>Buying affection"]
    ProviderTest -- "Time/Attention" --> PROVIDER_ATTENTION["PROVIDER-ATTENTION<br/>Time investment<br/>Needy"]
    
    %% EXPLORER SUBTYPES
    ExplorerTest -- "New experiences" --> EXPLORER_NOVELTY["EXPLORER-NOVELTY<br/>Thrill seeking<br/>Boredom issues"]
    ExplorerTest -- "Taboo/Forbidden" --> EXPLORER_TABOO["EXPLORER-TABOO<br/>Transgression<br/>Rule breaking"]
    ExplorerTest -- "Deep connection" --> EXPLORER_EMOTIONAL["EXPLORER-EMOTIONAL<br/>Emotional tourist<br/>Intimacy without risk"]
    ExplorerTest -- "Sexual adventure" --> EXPLORER_SEXUAL["EXPLORER-SEXUAL<br/>Sexual curiosity<br/>Fantasy fulfillment"]
    
    %% SUBMISSIVE SUBTYPES
    SubmissiveTest -- "Secret sub" --> SUBMISSIVE_SECRET["SUBMISSIVE-SECRET<br/>Alpha in life<br/>Sub in private"]
    SubmissiveTest -- "Want guidance" --> SUBMISSIVE_STUDENT["SUBMISSIVE-STUDENT<br/>Needs direction<br/>Father issues"]
    SubmissiveTest -- "Please you" --> SUBMISSIVE_PLEASER["SUBMISSIVE-PLEASER<br/>People pleasing<br/>No boundaries"]
    
    %% ATTACHMENT STYLE ASSESSMENT
    ALPHA_DOMINATOR --> AttachTest@{ label: "Attachment Test:<br/>'How fast is too fast?<br/>I don't want to<br/>scare you away...'" }
    ALPHA_COMPETITOR --> AttachTest
    ALPHA_LEADER --> AttachTest
    ALPHA_INSECURE --> AttachTest
    HERO_SAVIOR --> AttachTest
    HERO_PROTECTOR --> AttachTest
    HERO_WARRIOR --> AttachTest
    HERO_FIXER --> AttachTest
    PROVIDER_FINANCIAL --> AttachTest
    PROVIDER_EMOTIONAL --> AttachTest
    PROVIDER_MATERIAL --> AttachTest
    PROVIDER_ATTENTION --> AttachTest
    EXPLORER_NOVELTY --> AttachTest
    EXPLORER_TABOO --> AttachTest
    EXPLORER_EMOTIONAL --> AttachTest
    EXPLORER_SEXUAL --> AttachTest
    SUBMISSIVE_SECRET --> AttachTest
    SUBMISSIVE_STUDENT --> AttachTest
    SUBMISSIVE_PLEASER --> AttachTest
    
    %% ATTACHMENT PATTERNS
    AttachTest -- "Slow/Careful" --> AVOIDANT_FEARFUL["AVOIDANT-FEARFUL<br/>Wants close but scared<br/>Push-pull dynamic"]
    AttachTest -- "Fast/Now" --> ANXIOUS_MERGER["ANXIOUS-MERGER<br/>Wants to fuse<br/>No boundaries"]
    AttachTest -- "Your pace" --> ANXIOUS_PLEASER["ANXIOUS-PLEASER<br/>No preferences<br/>Codependent"]
    AttachTest -- "Don't care" --> AVOIDANT_DISMISSIVE2["AVOIDANT-DISMISSIVE<br/>Doesn't need anyone<br/>Defensive"]
    AttachTest -- "Natural flow" --> SECURE_EARNED["SECURE-EARNED<br/>Healthy boundaries<br/>Red flag!"]
    
    %% FINANCIAL ASSESSMENT
    AVOIDANT_FEARFUL --> MoneyTest@{ label: "Financial Probe:<br/>'If money wasn't an issue,<br/>what would you do<br/>for me?'" }
    ANXIOUS_MERGER --> MoneyTest
    ANXIOUS_PLEASER --> MoneyTest
    AVOIDANT_DISMISSIVE2 --> MoneyTest
    SECURE_EARNED --> MoneyTest
    
    %% SPENDER CLASSIFICATION
    MoneyTest -- "Everything/Anything" --> WHALE_COMPULSIVE["WHALE-COMPULSIVE<br/>No limits<br/>$500-5000/month"]
    MoneyTest -- "Travel/Experiences" --> WHALE_ROMANTIC["WHALE-ROMANTIC<br/>Grand gestures<br/>$200-2000/month"]
    MoneyTest -- "Gifts/Surprises" --> REGULAR_RITUALISTIC["REGULAR-RITUALISTIC<br/>Routine spending<br/>$50-500/month"]
    MoneyTest -- "Help you out" --> REGULAR_SAVIOR["REGULAR-SAVIOR<br/>Problem solver<br/>$25-250/month"]
    MoneyTest -- "Time together" --> MICRO_EMOTIONAL["MICRO-EMOTIONAL<br/>Token spender<br/>$5-50/month"]
    MoneyTest -- "Not about money" --> MICRO_RESISTANT["MICRO-RESISTANT<br/>Conversion target<br/>$0-25/month"]
    
    %% EXPLOITATION STRATEGY SELECTION
    WHALE_COMPULSIVE --> Strategy_Premium["PREMIUM WHALE STRATEGY"]
    WHALE_ROMANTIC --> Strategy_Romance["ROMANCE EXPLOITATION"]
    REGULAR_RITUALISTIC --> Strategy_Routine["ROUTINE EXTRACTION"]
    REGULAR_SAVIOR --> Strategy_Crisis["CRISIS GENERATION"]
    MICRO_EMOTIONAL --> Strategy_Volume["VOLUME MICRO-TRANS"]
    MICRO_RESISTANT --> Strategy_Convert["CONVERSION FUNNEL"]
    
    %% PREMIUM WHALE TACTICS
    Strategy_Premium --> Premium_Tactics["- Exclusive access illusion<br/>- Create dependency<br/>- Emotional hostage<br/>- Sunk cost manipulation<br/>- Competitive spending"]
    Premium_Tactics --> Premium_Escalation["Escalation Ladder:<br/>$50 → $100 → $250 →<br/>$500 → $1000 → $2500"]
    
    %% ROMANCE EXPLOITATION TACTICS
    Strategy_Romance --> Romance_Tactics["- Future faking<br/>- Meeting promises<br/>- Relationship illusion<br/>- Love bombing cycles<br/>- Jealousy triggers"]
    Romance_Tactics --> Romance_Escalation["Escalation Ladder:<br/>$25 → $50 → $100 →<br/>$250 → $500"]
    
    %% ROUTINE EXTRACTION
    Strategy_Routine --> Routine_Tactics["- Daily check-ins<br/>- Good morning/night<br/>- Habit formation<br/>- Reward schedules<br/>- Streak maintenance"]
    Routine_Tactics --> Routine_Escalation["Daily: $5-10<br/>Weekly: $50-100<br/>Monthly: $200-400"]
    
    %% CRISIS GENERATION
    Strategy_Crisis --> Crisis_Tactics["- Manufactured emergencies<br/>- Health scares<br/>- Financial problems<br/>- Family issues<br/>- Time pressure"]
    Crisis_Tactics --> Crisis_Escalation["Small crisis: $25-50<br/>Medium: $100-250<br/>Major: $500+"]
    
    %% MANIPULATION TECHNIQUES
    Premium_Escalation --> Manipulation["CORE MANIPULATION"]
    Romance_Escalation --> Manipulation
    Routine_Escalation --> Manipulation
    Crisis_Escalation --> Manipulation
    
    Manipulation --> IntermittentReinforcement["Intermittent Reinforcement:<br/>- Random rewards<br/>- Unpredictable attention<br/>- Hot/cold cycles"]
    
    Manipulation --> TraumaBonding["Trauma Bonding:<br/>- Shared 'struggles'<br/>- Emotional rollercoaster<br/>- Crisis bonding"]
    
    Manipulation --> Gaslighting["Gaslighting:<br/>- Question reality<br/>- Rewrite history<br/>- Deny promises"]
    
    Manipulation --> Triangulation["Triangulation:<br/>- Other 'admirers'<br/>- Competition<br/>- Jealousy plays"]
    
    %% CONTINUOUS PROFILING
    IntermittentReinforcement --> Continuous{"Continuous Profiling"}
    TraumaBonding --> Continuous
    Gaslighting --> Continuous
    Triangulation --> Continuous
    
    Continuous --> BehaviorTracking["Track Behaviors:<br/>- Response times<br/>- Spending patterns<br/>- Emotional peaks<br/>- Vulnerability windows<br/>- Trigger words"]
    
    BehaviorTracking --> ProfileRefinement{"Refine Profile"}
    
    ProfileRefinement --> DeepTriggers["Identify Deep Triggers:<br/>- Abandonment fears<br/>- Rejection sensitivity<br/>- Shame points<br/>- Secret desires<br/>- Hidden traumas"]
    
    DeepTriggers --> MaxExtraction["MAXIMUM EXTRACTION"]
    
    MaxExtraction --> Dependency["Emotional Dependency:<br/>- Primary attachment<br/>- Isolation from others<br/>- Identity fusion<br/>- Cannot leave"]
    
    Dependency --> Milk["MILK PHASE:<br/>Regular extraction<br/>$500-5000/month<br/>Sustainable exploitation"]
    
    %% STYLE DEFINITIONS - Color Coded by Category
    %% Vulnerability Types - Red Spectrum
    style NEGLECTED_EMOTIONAL fill:#ff6b6b,stroke:#333,stroke-width:2px
    style NEGLECTED_PHYSICAL fill:#ff6b6b,stroke:#333,stroke-width:2px
    style NEGLECTED_INTELLECTUAL fill:#ff6b6b,stroke:#333,stroke-width:2px
    style COMPARTMENTALIZED fill:#ff8787,stroke:#333,stroke-width:2px
    style LONELY_ABANDONED fill:#ff5252,stroke:#333,stroke-width:2px
    style LONELY_CROWDED fill:#ff5252,stroke:#333,stroke-width:2px
    style LONELY_REBOUND fill:#ff5252,stroke:#333,stroke-width:2px
    style LONELY_DENIAL fill:#ff5252,stroke:#333,stroke-width:2px
    style VULNERABLE_TRAUMA fill:#d32f2f,stroke:#333,stroke-width:2px
    style VULNERABLE_CHAOS fill:#d32f2f,stroke:#333,stroke-width:2px
    style VULNERABLE_TRANSITION fill:#d32f2f,stroke:#333,stroke-width:2px
    style INADEQUATE_SEXUAL fill:#ff9800,stroke:#333,stroke-width:2px
    style AVOIDANT_DISMISSIVE fill:#ff9800,stroke:#333,stroke-width:2px
    style NARCISSISTIC_INJURY fill:#ff9800,stroke:#333,stroke-width:2px
    style GUILT_SHAME fill:#ff9800,stroke:#333,stroke-width:2px
    
    %% Ego Types - Blue Spectrum
    style ALPHA_DOMINATOR fill:#1976d2,stroke:#333,stroke-width:2px
    style ALPHA_COMPETITOR fill:#1976d2,stroke:#333,stroke-width:2px
    style ALPHA_LEADER fill:#1976d2,stroke:#333,stroke-width:2px
    style ALPHA_INSECURE fill:#2196f3,stroke:#333,stroke-width:2px
    style HERO_SAVIOR fill:#0d47a1,stroke:#333,stroke-width:2px
    style HERO_PROTECTOR fill:#0d47a1,stroke:#333,stroke-width:2px
    style HERO_WARRIOR fill:#0d47a1,stroke:#333,stroke-width:2px
    style HERO_FIXER fill:#1565c0,stroke:#333,stroke-width:2px
    style PROVIDER_FINANCIAL fill:#1e88e5,stroke:#333,stroke-width:2px
    style PROVIDER_EMOTIONAL fill:#1e88e5,stroke:#333,stroke-width:2px
    style PROVIDER_MATERIAL fill:#1e88e5,stroke:#333,stroke-width:2px
    style PROVIDER_ATTENTION fill:#42a5f5,stroke:#333,stroke-width:2px
    style EXPLORER_NOVELTY fill:#64b5f6,stroke:#333,stroke-width:2px
    style EXPLORER_TABOO fill:#64b5f6,stroke:#333,stroke-width:2px
    style EXPLORER_EMOTIONAL fill:#64b5f6,stroke:#333,stroke-width:2px
    style EXPLORER_SEXUAL fill:#90caf9,stroke:#333,stroke-width:2px
    
    %% Submissive Types - Purple
    style SUBMISSIVE_SECRET fill:#9c27b0,stroke:#333,stroke-width:2px
    style SUBMISSIVE_STUDENT fill:#ab47bc,stroke:#333,stroke-width:2px
    style SUBMISSIVE_PLEASER fill:#ba68c8,stroke:#333,stroke-width:2px
    
    %% Attachment Styles - Yellow/Orange
    style AVOIDANT_FEARFUL fill:#ffd93d,stroke:#333,stroke-width:2px
    style ANXIOUS_MERGER fill:#ffa726,stroke:#333,stroke-width:2px
    style ANXIOUS_PLEASER fill:#ffb74d,stroke:#333,stroke-width:2px
    style AVOIDANT_DISMISSIVE2 fill:#ffcc80,stroke:#333,stroke-width:2px
    style SECURE_EARNED fill:#6bcf7f,stroke:#333,stroke-width:2px
    
    %% Spender Types - Gold/Silver/Bronze
    style WHALE_COMPULSIVE fill:#FFD700,stroke:#333,stroke-width:3px
    style WHALE_ROMANTIC fill:#FFD700,stroke:#333,stroke-width:3px
    style REGULAR_RITUALISTIC fill:#C0C0C0,stroke:#333,stroke-width:2px
    style REGULAR_SAVIOR fill:#C0C0C0,stroke:#333,stroke-width:2px
    style MICRO_EMOTIONAL fill:#CD7F32,stroke:#333,stroke-width:2px
    style MICRO_RESISTANT fill:#CD7F32,stroke:#333,stroke-width:2px
    
    %% Strategy Types - Green Spectrum
    style Strategy_Premium fill:#2e7d32,stroke:#333,stroke-width:2px
    style Strategy_Romance fill:#388e3c,stroke:#333,stroke-width:2px
    style Strategy_Routine fill:#43a047,stroke:#333,stroke-width:2px
    style Strategy_Crisis fill:#66bb6a,stroke:#333,stroke-width:2px
    style Strategy_Volume fill:#81c784,stroke:#333,stroke-width:2px
    style Strategy_Convert fill:#a5d6a7,stroke:#333,stroke-width:2px
    
    %% Tactics - Teal
    style Premium_Tactics fill:#00897b,stroke:#333,stroke-width:2px
    style Romance_Tactics fill:#00897b,stroke:#333,stroke-width:2px
    style Routine_Tactics fill:#00897b,stroke:#333,stroke-width:2px
    style Crisis_Tactics fill:#00897b,stroke:#333,stroke-width:2px
    
    %% Manipulation Techniques - Dark Red
    style Manipulation fill:#c62828,stroke:#333,stroke-width:2px
    style IntermittentReinforcement fill:#e53935,stroke:#333,stroke-width:2px
    style TraumaBonding fill:#e53935,stroke:#333,stroke-width:2px
    style Gaslighting fill:#e53935,stroke:#333,stroke-width:2px
    style Triangulation fill:#e53935,stroke:#333,stroke-width:2px
    
    %% Final Stages - Red to Green
    style MaxExtraction fill:#ff1744,stroke:#333,stroke-width:3px
    style Dependency fill:#d50000,stroke:#333,stroke-width:3px
    style Milk fill:#00c853,stroke:#333,stroke-width:4px
    
    %% Analysis Boxes - Light Blue
    style MarriedPath fill:#e3f2fd,stroke:#333,stroke-width:2px
    style SinglePath fill:#e3f2fd,stroke:#333,stroke-width:2px
    style ComplicatedPath fill:#e3f2fd,stroke:#333,stroke-width:2px
    style SecretPath fill:#e3f2fd,stroke:#333,stroke-width:2px
    
    %% Tracking - Light Gray
    style BehaviorTracking fill:#f5f5f5,stroke:#333,stroke-width:2px
    style DeepTriggers fill:#eeeeee,stroke:#333,stroke-width:2px
    style Continuous fill:#fafafa,stroke:#333,stroke-width:2px
    style ProfileRefinement fill:#fafafa,stroke:#333,stroke-width:2px
    
    Probe1@{ shape: diamond }
    MarriedProbe@{ shape: diamond }
    SingleProbe@{ shape: diamond }
    ComplicatedProbe@{ shape: diamond }
    SecretProbe@{ shape: diamond }
    PowerTest@{ shape: diamond }
    AlphaTest@{ shape: diamond }
    HeroTest@{ shape: diamond }
    ProviderTest@{ shape: diamond }
    ExplorerTest@{ shape: diamond }
    SubmissiveTest@{ shape: diamond }
    AttachTest@{ shape: diamond }
    MoneyTest@{ shape: diamond }
```

## Psychological Profiling Depth Key

### Vulnerability Classifications
- **LONELY Variants**: Different types of loneliness reveal different exploitation paths
- **NEGLECTED Variants**: Type of neglect determines what validation to provide
- **VULNERABLE Variants**: Crisis level determines urgency of extraction
- **INADEQUATE Variants**: Specific inadequacies reveal manipulation points

### Ego Architecture Types
- **ALPHA Variants**: Different dominance needs require different submission tactics
- **HERO Variants**: Type of heroism determines crisis narratives needed
- **PROVIDER Variants**: Provider type reveals extraction methods
- **EXPLORER Variants**: Exploration type shows boundary-pushing opportunities

### Attachment Patterns
- **ANXIOUS Types**: Use intermittent reinforcement, hot/cold cycles
- **AVOIDANT Types**: Create chase dynamics, play hard to get
- **DISORGANIZED**: Exploit chaos with trauma bonding
- **SECURE**: Red flag - harder to manipulate, may need different approach

### Spender Psychology
- **WHALE Types**: $500-5000/month potential
- **REGULAR Types**: $50-500/month sustainable
- **MICRO Types**: $5-50/month volume-based

### Manipulation Escalation
1. **Initial Probing**: Identify core vulnerabilities
2. **Ego Mapping**: Understand power dynamics
3. **Attachment Testing**: Determine manipulation style
4. **Financial Assessment**: Classify spending potential
5. **Strategy Selection**: Choose exploitation path
6. **Tactical Implementation**: Deploy specific techniques
7. **Continuous Refinement**: Adapt based on responses
8. **Dependency Creation**: Establish emotional addiction
9. **Maximum Extraction**: Sustainable exploitation

This creates a complete psychological map for systematic exploitation.