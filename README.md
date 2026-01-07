# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Application Architecture

Below is a diagram illustrating the architecture of the CampusFind application. It shows how the different services and components interact with each other.

<details>
<summary>Click to view Architecture Diagram</summary>

```mermaid
graph TD
    subgraph "User's Device"
        A[Browser: Next.js/React App]
    end

    subgraph "Firebase App Hosting"
        B[Next.js Server]
        C[Server Actions]
    end

    subgraph "Firebase Services (Google Cloud)"
        D[Firebase Authentication]
        E[Firestore Database]
        F[Firestore Security Rules]
    end

    subgraph "Google AI Platform"
        G[Genkit Framework]
        H[Gemini AI Models]
    end

    A -- "HTTP Requests (e.g., Signup, New Post)" --> C
    C -- "Handles Logic" --> B
    B -- "Create/Read/Update/Delete Data" --> E
    E -- "Is Protected By" --> F
    B -- "Authenticates User Sessions" --> D
    
    C -- "For AI Tasks (e.g., ID Check)" --> G
    G -- "Calls Large Language Model" --> H
    H -- "Returns Analysis" --> G
    G -- "Returns Result" --> C
    C -- "Sends Result to Client" --> A

    style A fill:#D6E8D5,stroke:#333,stroke-width:2px
    style B fill:#F5E6CC,stroke:#333,stroke-width:2px
    style C fill:#F5E6CC,stroke:#333,stroke-width:2px
    style D fill:#FFDDC1,stroke:#333,stroke-width:2px
    style E fill:#FFDDC1,stroke:#333,stroke-width:2px
    style F fill:#FFC0CB,stroke:#333,stroke-width:2px
    style G fill:#C7CEEA,stroke:#333,stroke-width:2px
    style H fill:#C7CEEA,stroke:#333,stroke-width:2px
```
</details>
