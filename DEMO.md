# AI Auto Healer - 2-Minute Hackathon Demo Script

This script is designed for a highly impactful, 2-minute pitch demonstration of the AI Auto Healer MVP.

---

### Phase 1: The Setup (0:00 - 0:30)
*Action: Display the Next.js Dashboard. Ensure both backend and frontend servers are running, with Docker (PostgreSQL & Redis) up.*

**Speaker:**
> "Modern microservices break. When they do, DevOps teams scramble through thousands of log lines to find the root cause. We built **AI Auto Healer** to completely automate incident diagnosis and resolution."
>
> "As you can see, our dashboard is currently connected to our infrastructure, showing healthy services. Let's see what happens when a critical failure occurs."

---

### Phase 2: The Incident (0:30 - 1:00)
*Action: Click the **Simulate Incident** button in the dashboard header.*

**Speaker:**
> "I'll simulate a severe incident—our payment gateway just lost its connection to Stripe."
> 
> *(Wait for the Log Terminal to flash the incoming RED error log. Watch the Incident Table dynamically populate a new row).*
>
> "In real-time, our system intercepts the `ERROR` log via WebSockets. It immediately generates an incident and queues it into our Redis-backed BullMQ processing engine."

---

### Phase 3: AI Diagnosis (1:00 - 1:30)
*Action: The Incident Table status will flip from "INVESTIGATING" to "OPEN". Click the **Details** button on the new incident row.*

**Speaker:**
> "Our asynchronous AI worker intercepts the logs and feeds them into Gemini 2.5 Pro. It instantly returns a structured root cause analysis."
> 
> *(Point to the Modal UI elements)*
> "Here, we see the AI's confidence level, a deep explanation of the Stripe timeout, and crucially, an actionable fix."

---

### Phase 4: Resolution & Wrap-up (1:30 - 2:00)
*Action: Point to the generated bash commands. Click **Download Fix Script**, then click **Create Draft PR**.*

**Speaker:**
> "Instead of just giving us text, AI Auto Healer generates exact, executable bash commands to resolve the issue."
>
> "We can download this script immediately, or better yet, seamlessly generate a GitHub Draft Pull Request so the rest of the team can review the infrastructure fix."
>
> *(Show the generated PR link toast/notification)*
> "With AI Auto Healer, we turned a 2-hour firefighting exercise into a 2-minute automated resolution. Thank you."
