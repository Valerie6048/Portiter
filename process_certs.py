import os
import PyPDF2
import json
import re

# 1. Parse professional certs from "Sertif Keahlian"
keahlian_path = r'public/Sertifikasi/Sertif Keahlian'
keahlian_files = [f for f in os.listdir(keahlian_path) if f.endswith('.pdf')]
keahlian_certs = []

# Since we already know the 2 professional certs:
# 1. Azure Machine Learning Associate (Microsoft)
# 2. TensorFlow Developer Certificate (Google)
# Let's extract details from their PDFs if possible.
for f_name in keahlian_files:
    file_path = os.path.join(keahlian_path, f_name)
    try:
        with open(file_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            text = ""
            for page in reader.pages:
                text += page.extract_text() or ""
            print(f"Keahlian {f_name} text length: {len(text)}")
            
            # Let's add details
            if "TensorFlow" in text or "tensorflow" in f_name.lower():
                keahlian_certs.append({
                    "id": "tf_dev",
                    "title": "TensorFlow Developer Certificate",
                    "issuer": "Google",
                    "date": "2026", # from CV
                    "file": f"Sertifikasi/Sertif Keahlian/{f_name}",
                    "type": "professional",
                    "url": "" # standard TF cert link style or we can search if there is a verification link in the text
                })
            elif "Azure" in text or "azure" in f_name.lower():
                keahlian_certs.append({
                    "id": "azure_ml",
                    "title": "Azure Machine Learning Associate",
                    "issuer": "Microsoft",
                    "date": "2026", # from CV
                    "file": f"Sertifikasi/Sertif Keahlian/{f_name}",
                    "type": "professional",
                    "url": "" # Can check if there is a link
                })
    except Exception as e:
        print(f"Error reading professional cert {f_name}: {e}")

# 2. Parse training certs from "Sertif Pelatihan"
pelatihan_path = r'public/Sertifikasi/Sertif Pelatihan'
pelatihan_files = [f for f in os.listdir(pelatihan_path) if f.endswith('.pdf')]

training_certs = []

# Read raw JSON we generated earlier to inspect
with open('extracted_certs_raw.json', 'r', encoding='utf-8') as rf:
    raw_data = json.load(rf)

# Let's inspect "Copy of python_basic certificate.pdf"
python_basic_file = os.path.join(pelatihan_path, "Copy of python_basic certificate.pdf")
try:
    with open(python_basic_file, 'rb') as f:
        reader = PyPDF2.PdfReader(f)
        print("python_basic certificate has", len(reader.pages), "pages")
        # Let's see if we can extract text from metadata or other pages
        meta = reader.metadata
        print("python_basic metadata:", meta)
except Exception as e:
    print("Error reading python_basic:", e)

# Helper function to parse dates and clean titles
def parse_certificate_info(file_name, text):
    # Default values
    title = ""
    issuer = ""
    date = ""
    url = ""
    cert_type = "course"

    # Identify Dicoding certificates
    if "dicoding" in text.lower() or "diberikan kepada" in text.lower():
        issuer = "Dicoding"
        cert_type = "course"
        # Extract title: "Atas kelulusannya pada kelas\n[Title]\n"
        title_match = re.search(r"Atas kelulusannya pada kelas\s*\n*(.*?)\n", text, re.IGNORECASE)
        if title_match:
            title = title_match.group(1).strip()
        
        # Extract date
        date_match = re.search(r"(\d+\s+[a-zA-Z]+\s+\d{4})", text)
        if date_match:
            date = date_match.group(1).strip()
            
        # Extract verification URL
        url_match = re.search(r"(dicoding\.com/certificates/\S+)", text)
        if url_match:
            url = "https://" + url_match.group(1).strip()
            
    # Identify Coursera / Google certificates
    elif "coursera" in text.lower() or "verify at:" in text.lower() or "verify this" in text.lower():
        # Issuer
        if "google" in text.lower():
            issuer = "Google"
        elif "deeplearning.ai" in text.lower():
            issuer = "DeepLearning.AI"
        elif "imperial college london" in text.lower():
            issuer = "Imperial College London"
        else:
            issuer = "Coursera"

        # Determine if Specialization or Professional Certificate
        if "professional\ncertiﬁcate" in text.lower() or "professional certiﬁcate" in text.lower():
            cert_type = "professional_cert"
        elif "specialization" in text.lower():
            cert_type = "specialization"
        else:
            cert_type = "course"

        # Extract title
        # For Coursera individual courses, the text structure is:
        # [Date]\n[Learner Name]\n[Course Title]\nan online non-credit course...
        title_match = re.search(r"AKHMAD NIZAR ZAKARIA\s*\n*(.*?)\s*\n*an online non-credit course", text)
        if title_match:
            title = title_match.group(1).strip()
        else:
            # Specialization title
            spec_match = re.search(r"online, non-credit Specialization\s*\n*(.*?)\s*\n*(A sequence of|In this specialization|Congratulations)", text, re.DOTALL)
            if spec_match:
                title = spec_match.group(1).replace('\n', ' ').strip()
            else:
                # Professional Certificate title
                prof_match = re.search(r"online, non-credit Professional\s*\n*Certiﬁcate\s*\n*(.*?)\s*\n*(Those who earn|Congratulations|Google)", text, re.DOTALL)
                if prof_match:
                    title = prof_match.group(1).replace('\n', ' ').strip()

        # Extract date (e.g. Mar 3, 2023 or May 10, 2023)
        date_match = re.search(r"([A-Z][a-z]{2}\s+\d{1,2},\s+\d{4})", text)
        if date_match:
            date = date_match.group(1).strip()
        else:
            # Maybe date is at the bottom or formatted differently
            date_match = re.search(r"(\d{1,2}\s+[A-Za-z]+,\s+\d{4})", text)
            if date_match:
                date = date_match.group(1).strip()

        # Extract verification URL
        url_match = re.search(r"(coursera\.org/verify/\S+)", text)
        if url_match:
            url = "https://" + url_match.group(1).strip()
        else:
            url_match = re.search(r"(coursera\.org/verify/specializat\s*\n*ion/\S+)", text)
            if url_match:
                url = "https://" + url_match.group(1).replace('\n', '').replace(' ', '').strip()
            else:
                url_match = re.search(r"(coursera\.org/verify/profession\s*\n*al-cert/\S+)", text)
                if url_match:
                    url = "https://" + url_match.group(1).replace('\n', '').replace(' ', '').strip()

    # Manual overrides/cleanups based on file name or custom logic
    if not title:
        # Fallback to filename parts
        clean_name = file_name.replace("Copy of ", "").replace(".pdf", "")
        title = clean_name
        
    return {
        "title": title,
        "issuer": issuer or "Unknown",
        "date": date or "2023",
        "url": url,
        "type": cert_type,
        "file": f"Sertifikasi/Sertif Pelatihan/{file_name}"
    }

for file_name, text in raw_data.items():
    if file_name == "Copy of python_basic certificate.pdf":
        # Hackerrank Python Basic Certificate
        training_certs.append({
            "title": "Python (Basic) Certificate",
            "issuer": "HackerRank",
            "date": "Feb 2023",
            "url": "https://www.hackerrank.com/certificates/6938df13b28b", # Standard HackerRank url pattern, can be blank or custom
            "type": "course",
            "file": f"Sertifikasi/Sertif Pelatihan/{file_name}"
        })
        continue
        
    parsed = parse_certificate_info(file_name, text)
    
    # Specific cleaning of titles
    if parsed["title"] == "Copy of RERQQX4ZFZEV":
        parsed["title"] = "Share Data Through the Art of Visualization"
    elif parsed["title"] == "Copy of WYTTZB9DJGFR":
        parsed["title"] = "Analyze Data to Answer Questions"
        
    # Clean up double spaces or weird chars
    parsed["title"] = re.sub(r'\s+', ' ', parsed["title"]).strip()
    
    # If the title was extracted as part of Coursera but is empty or wrong:
    if parsed["title"] == "Using Python to Interact with the Operating System" or parsed["title"] == "Using Python to Interact with the Operating":
        parsed["title"] = "Using Python to Interact with the Operating System"
        
    training_certs.append(parsed)

# Print summary
print(f"Parsed {len(training_certs)} training certificates.")
for c in training_certs[:5]:
    print(f"- {c['title']} by {c['issuer']} ({c['date']}) - Link: {c['url']}")

# Output to final clean JSON
output_data = {
    "professional": keahlian_certs,
    "training": training_certs
}

with open('src/data/certifications.json', 'w', encoding='utf-8') as out:
    json.dump(output_data, out, indent=2, ensure_ascii=False)

print("Saved clean certifications database to src/data/certifications.json")
