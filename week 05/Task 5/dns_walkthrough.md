# DNS Walkthrough: Mapping a Custom Subdomain

This walkthrough serves as the checklist and explanation for pointing your future custom FlyRank subdomain (`saadali.flyrank.ai`) to your personal site hosted on Netlify (e.g., `saadali.netlify.app`). 

---

## 1. What is a CNAME Record?

A **CNAME (Canonical Name)** record is a type of DNS record that acts as an **alias** or a "nickname" pointing one domain name to another domain name, rather than pointing directly to a numeric IP address.

### The Phonebook Analogy:
Think of an A record (Address record) like a phonebook entry that maps a name directly to a phone number: 
`Saad Ali` ➔ `+1 (555) 019-9234`

A CNAME record is like mapping an alias to a name that already has a phone number:
`Developer Saad` ➔ Alias of `Saad Ali` (which then points to the phone number).

**Why do we use it?** If the phone number (IP address) of the hosting server changes, only the primary domain name (`saadali.netlify.app`) needs its IP record updated. The alias (`saadali.flyrank.ai`) continues to work perfectly without any modifications.

---

## 2. What Value Will Yours Hold?

When your custom subdomain is provisioned at the end of the track:
- **Host Name / Subdomain:** `saadali.flyrank.ai` (Your custom name)
- **Record Type:** `CNAME`
- **Value (Destination):** `saadali.netlify.app` (The free Netlify URL where your site is currently live)

This tells the internet: *"Whenever someone requests `saadali.flyrank.ai`, look up `saadali.netlify.app` to find the actual website server."*

---

## 3. The DNS Resolution Lifecycle (Step-by-Step)

Here is exactly what happens behind the scenes in the ~100 milliseconds between someone typing `saadali.flyrank.ai` into their browser and the page loading:

1. **The Request (Browser)**:
   You type `saadali.flyrank.ai` in your browser. The browser doesn't know what server that is, so it asks your local network's **DNS Resolver**.
   
2. **The Resolver (The Investigator)**:
   Usually run by your ISP (e.g., Comcast) or a public service (Google 8.8.8.8, Cloudflare 1.1.1.1). The Resolver is like an investigator that goes out to query the DNS hierarchy on your behalf.
   
3. **The Root Nameserver (The Directory)**:
   The Resolver asks the **Root Nameserver** (`.`). The Root server says, *"I don't know the exact IP, but I know the directory for all `.ai` domains. Go ask the `.ai` TLD server."*
   
4. **The TLD Nameserver (The Country/Category Registrar)**:
   The Resolver queries the **Top-Level Domain (TLD) Nameserver** for `.ai`. The TLD server says, *"I don't know the site's IP, but I know the Authoritative Nameserver that manages the `flyrank.ai` domain. Go ask them."*
   
5. **The Authoritative Nameserver (The Source of Truth)**:
   The Resolver queries the `flyrank.ai` **Authoritative Nameserver**. It looks up its zone records and answers: *"I have a CNAME record here. `saadali.flyrank.ai` is actually an alias for `saadali.netlify.app`."*
   
6. **The Redirection & IP Fetch (Netlify DNS)**:
   Now the Resolver knows it needs to find `saadali.netlify.app`. It queries Netlify's Authoritative Nameservers. Netlify responds with an IP address (e.g., `104.198.14.32`).
   
7. **The Response & Load**:
   The Resolver returns the IP address to the browser. The browser contacts that IP address directly via HTTPS, the server serves the webpage, and the user sees the portfolio.
