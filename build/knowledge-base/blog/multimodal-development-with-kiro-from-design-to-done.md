---
title: "Multimodal development with Kiro: from design to done"
sourceUrl: "https://kiro.dev/blog/multimodal-development-with-kiro-from-design-to-done/"
category: "blog"
lastUpdated: "2026-02-07T05:52:42.176Z"
---
Software architecture and engineering is both an art and a science. We craft elegant designs that solve complex problems, but somewhere between the initial design and final deployment, that vision can get lost in translation. If you’re like most developers and architects, you have experienced this firsthand. You spend hours perfecting system diagrams, only to watch the implementation drift away from your original design. Requirements change, developers interpret your diagrams differently, and before you know it, your elegant architecture becomes a patchwork of compromises that are outdated before it even gets deployed.

Traditional systems development is broken. The gap between diagrams and deployed code wastes time, creates technical debt, and delivers systems that miss the mark. But it doesn't have to be this way.

I recently tackled this challenge head-on while building a financial trading system with Kiro. This is the kind of project where architectural missteps mean real money lost and potential compliance nightmares. Instead of the traditional weeks spent translating ERDs (Entity-Relationship Diagrams) into database schemas and UML (Unified Modeling Language) diagrams into service interfaces, Kiro's multimodal agent chat transformed my whiteboard sketches into production code in days, not weeks.

Let me show you how Kiro's ability to process visual diagrams alongside code and documentation changed everything – and how it can transform your development process too.

## From whiteboard photo to TypeScript models

I started where most projects begin - with a whiteboard and a few markers. The ERD I sketched showed the core entities of a financial trading system: users connected to accounts, which hold positions and execute orders that become trades, all fed by real-time market data.

This is where Kiro's multimodal capabilities shine. Instead of manually translating my diagram, I uploaded a photo of my whiteboard directly to Kiro and started a conversation about what I wanted to build.

Kiro didn’t just see an image; it understood the entities, relationships, and business logic represented in my hand-drawn diagram. Within minutes, it analyzed the visual input and created comprehensive specifications that captured not just what I had drawn, but the implied requirements for a real financial trading system.

The visual diagram provided Kiro with the structural context, and through our chat conversation, I could add business nuances that no diagram could capture. We discussed compliance and regulatory requirements, latency expectations, and security considerations. With each interaction, Kiro updated the specifications while maintaining perfect alignment with my original visual design.

Here’s where Kiro’s multimodal approach proves its value. Kiro took my ERD and generated actual TypeScript models that corresponded to my whiteboard sketch. The generated code wasn’t just syntactically correct – it included business logic, relationships, and constraints that were implied in my original diagram. Entities like User, Account, Order, Trade, and Position became fully formed TypeScript classes with proper validation, relationships, and methods.

Looking at the generated classes and database schema I asked Kiro to create along the way, I could see how the simple ERD I drew on a whiteboard had evolved into a production-ready system. Additional object types and relationships were uncovered that I hadn’t initially considered: audit trails, user permissions, portfolio hierarchies, and regulatory compliance fields that are essential for a real financial trading system.

## From architecture discussion to infrastructure diagram

Based on our conversation about scalability, security, and deployment requirements for a financial trading system, Kiro created a comprehensive cloud-agnostic Kubernetes architecture. Along with this plan, Kiro created documentation that included a Mermaid diagram to visualize the system architecture. While the diagram was informative, I requested Kiro to convert it to an SVG format to enhance readability and allow for better scaling across different viewing platforms.

Kiro’s architectural design addressed the specific performance and compliance constraints of financial trading systems. Low-latency trading services were deployed on dedicated node pools, featuring CPU pinning and optimized networking configurations. The data layer achieved high availability through PostgreSQL and TimescaleDB running in StatefulSets distributed across multiple availability zones. Event-driven messaging used Kafka for order processing and real-time market data streaming, while comprehensive security implemented network policies, pod security standards, and HashiCorp Vault for secrets management. The system was designed with regulatory compliance in mind through immutable audit logging, data residency controls, and automated compliance monitoring.

Kiro understood that a financial trading system needs portability across deployment environments. The architecture it designed runs on AWS EKS, Google GKE, Azure AKS, or on-premises Kubernetes clusters without modification, incorporating industry best practices for containerized applications while remaining cloud-agnostic.

This architecture diagram then became the input for the next phase. Using both the visual Kubernetes architecture and our discussion context, Kiro generated complete Kubernetes manifests that implemented our architectural decisions. The generated infrastructure as code (IaC) included namespace organization with proper labeling for compliance and environment management, service deployments with anti-affinity rules and resource limits optimized for each component, and StatefulSet configurations for databases with persistent volume claims. Network policies implemented micro-segmentation between services, while Horizontal Pod Autoscalers with custom metrics managed for financial workloads. All of this was secured following Kubernetes best practices.

The generated Kubernetes resources included production-ready configurations such as pod disruption budgets, resource quotas, and monitoring annotations. Kiro translated our high-level architectural conversation into deployable infrastructure that followed cloud-native best practices while meeting the specific performance and compliance requirements of financial trading systems.

## The multimodal advantage and results

What made this approach so powerful wasn’t just that Kiro could process images; it was that Kiro could simultaneously understand visual diagrams, maintain context from our conversations, reference the generated code files, and provide consistency across all these different input types while challenging me to think beyond implementation details.

Traditional AI development tools would have required separate interactions for each phase: one tool to interpret diagrams, another to generate specifications, a third for code generation, and yet another for infrastructure planning. Each handoff would have lost context, created inconsistencies, and required manual reconciliation. The result would have been weeks of additional development time and significant churn as each tool's output diverged from the original design intent.

Kiro's agent-based approach maintained traceability throughout the entire development process. After three days and roughly 15 hours of development time, I had a nearly complete financial trading system that matched my original visual design. The generated code directly reflected the entities and relationships I had sketched, while incorporating all the additional complexity discovered through our conversations. Each phase informed the next while maintaining traceability back to my original whiteboard sketches, and Kiro worked alongside me to solve complex engineering problems around compliance, performance, and scalability with confidence.

Most importantly, Kiro's agents didn't just generate code; they challenged architectural decisions, suggested improvements for regulatory compliance, and identified potential performance bottlenecks that I hadn't initially considered. This collaborative approach helped preserve the initial design vision throughout the enhancements we made, rather than lost in translation across multiple disconnected sessions and tools.

## The future is multimodal

This experience showcases what's possible when AI agents can truly understand and process multiple types of input simultaneously. From whiteboard photos to generated code, from architecture diagrams to infrastructure configurations – each step builds upon the previous while maintaining design integrity.

If you're tired of watching your beautiful designs become disconnected implementations, try multimodal development. Start with a hand-drawn diagram, upload it to Kiro, and let it understand your visual design and help you maintain that integrity all the way to production. The future isn't about choosing between visual design and code generation; it's about AI that can seamlessly work with both, ensuring your original vision makes it to production intact.

Ready to streamline your journey from diagrams to deployment? [Get started with Kiro](/downloads/) for free and experience multimodal development for yourself! Upload your own diagrams and experience the seamless transition from visual design to working code.

Share your experience with us on [X](https://x.com/kirodotdev) or [LinkedIn](https://www.linkedin.com/showcase/kirodotdev), and join our [Discord community](https://discord.com/invite/kirodotdev) to connect with other developers using multimodal development to transform their workflows.

The gap between design and implementation doesn’t have to exist anymore. With multimodal AI, your diagram can become your code, and your vision can become reality faster and more accurately than ever before.