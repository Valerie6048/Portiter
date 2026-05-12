export const projectDetails = {
  en: {
    genai: {
      title: 'Generative AI & Clinical Intelligence',
      subtitle: 'RAG-Powered Healthcare Solutions',
      color: 'blue',
      usecase: {
        title: 'Use Case',
        content:
          'In the healthcare and clinical research domain, professionals face the challenge of manually matching patients to suitable clinical trials, extracting structured data from complex electronic Case Report Forms (eCRFs), and grading Adverse Events accurately. These tasks are time-consuming, error-prone, and require deep domain expertise.',
      },
      approach: {
        title: 'Approach',
        items: [
          {
            heading: 'Clinical Trial Matching System (CTMS)',
            detail:
              'Architected a system for oncology utilizing Retrieval-Augmented Generation (RAG) combined with SLM/LLM reasoning to optimize patient-trial alignment. The system retrieves relevant trial criteria from a vectorized knowledge base and uses LLM reasoning to evaluate eligibility.',
          },
          {
            heading: 'eCRF Data Extraction',
            detail:
              'Developed an automated pipeline to extract data from Clinical Research Forms (eCRF) into structured JSON formats optimized for HTML rendering, eliminating manual data entry and reducing errors.',
          },
          {
            heading: 'Adverse Events Recommendation Engine',
            detail:
              'Built a context-aware recommendation engine for CTCAE (Common Terminology Criteria for Adverse Events) using RAG and LLMs to provide precise clinical reasoning and grading suggestions.',
          },
          {
            heading: 'Multimodal Model Assessment',
            detail:
              'Conducted modality support assessments (Text, Image, Audio, Video) for frontier models like Gemini, GPT, and Claude to ensure platform compatibility across different input types.',
          },
        ],
      },
      results: {
        title: 'Results',
        items: [
          'Reduced patient-trial matching time significantly through automated RAG-based retrieval',
          'Eliminated manual eCRF data entry with automated JSON extraction pipeline',
          'Provided accurate CTCAE grading recommendations with contextual clinical reasoning',
          'Validated multimodal compatibility across 3 major LLM platforms (Gemini, GPT, Claude)',
        ],
      },
      techStack: {
        title: 'Tech Stack',
        items: [
          'Python',
          'RAG (Retrieval-Augmented Generation)',
          'LLM / SLM',
          'Azure AI Foundry',
          'NLP',
          'Vector Databases',
          'Gemini / GPT / Claude',
          'FastAPI',
        ],
      },
    },

    predictive: {
      title: 'Predictive Modeling & Marketing Science',
      subtitle: 'Forecasting & Budget Optimization',
      color: 'purple',
      usecase: {
        title: 'Use Case',
        content:
          'Marketing teams need accurate demand forecasting to plan campaigns, allocate budgets efficiently across channels, and account for seasonal variations like Ramadhan. Traditional models often fail to capture these nuances, leading to suboptimal budget allocation and missed revenue opportunities.',
      },
      approach: {
        title: 'Approach',
        items: [
          {
            heading: 'Time-Series Forecasting with Guardrails',
            detail:
              'Engineered business-grade time-series forecasting models with integrated output guardrails and probabilistic ranges (P10, P50, P90) to ensure realistic business outputs and quantify prediction uncertainty.',
          },
          {
            heading: 'Ramadhan Season Optimization',
            detail:
              'Optimized forecasting accuracy for high-seasonality periods, specifically addressing Ramadhan impacts through hyperparameter tuning, seasonality adjustments, and custom feature engineering.',
          },
          {
            heading: 'Marketing Budget Allocation',
            detail:
              'Developed machine learning models for marketing budget allocation using regression and Bayesian optimization to maximize cross-channel performance and ROI.',
          },
        ],
      },
      results: {
        title: 'Results',
        items: [
          'Delivered probabilistic forecasts with P10/P50/P90 bands for business decision-making',
          'Improved forecasting accuracy during Ramadhan season through targeted seasonal modeling',
          'Optimized marketing budget allocation across multiple channels using Bayesian optimization',
          'Provided actionable insights for campaign planning with data-driven recommendations',
        ],
      },
      techStack: {
        title: 'Tech Stack',
        items: [
          'Python',
          'XGBoost',
          'CatBoost',
          'Scikit-learn',
          'Bayesian Optimization',
          'Pandas',
          'Azure ML Platform',
          'BigQuery',
        ],
      },
    },

    mlops: {
      title: 'Infrastructure & MLOps',
      subtitle: 'Cloud AI Services & Data Pipelines',
      color: 'green',
      usecase: {
        title: 'Use Case',
        content:
          'Scaling AI solutions requires robust infrastructure for cost tracking, video content analysis, and automated data pipelines. Without proper tooling, teams lack visibility into AI service costs and struggle to extract insights from unstructured video content at scale.',
      },
      approach: {
        title: 'Approach',
        items: [
          {
            heading: 'Azure AI Cost Calculation Engine',
            detail:
              'Built an internal cost calculation engine to estimate token, video, and storage costs for Azure AI services, providing granular usage transparency and helping teams make informed decisions about resource allocation.',
          },
          {
            heading: 'Video Content Analysis',
            detail:
              'Implemented video content analysis and creative deduplication using Azure Video Indexer and Computer Vision APIs to optimize engagement insights and identify unique content patterns.',
          },
          {
            heading: 'Production Data Pipelines',
            detail:
              'Designed and implemented end-to-end data pipelines for production environments, handling ETL processes from raw data ingestion to model-ready feature stores in Azure environments.',
          },
        ],
      },
      results: {
        title: 'Results',
        items: [
          'Provided granular cost transparency for Azure AI services across token, video, and storage dimensions',
          'Automated video content analysis and deduplication, reducing manual review effort',
          'Established reliable production data pipelines supporting end-to-end ML workflows',
          'Enabled data-driven infrastructure decisions through comprehensive monitoring and reporting',
        ],
      },
      techStack: {
        title: 'Tech Stack',
        items: [
          'Python',
          'Azure Video Indexer',
          'Azure Computer Vision',
          'Azure Blob Storage',
          'Azure Functions',
          'Azure ML Platform',
          'Docker',
          'PostgreSQL',
        ],
      },
    },

    cafe: {
      title: 'Cafe Recommendation System',
      subtitle: 'Content-Based Filtering for Local Cafes',
      color: 'blue',
      usecase: {
        title: 'Use Case',
        content:
          'Finding the right cafe in Malang that matches specific preferences — such as ambiance, price range, amenities (charging ports, spacious parking, industrial theme) — can be challenging. Users need a smart recommendation system that understands descriptive queries and suggests relevant cafes.',
      },
      approach: {
        title: 'Approach',
        items: [
          {
            heading: 'Content-Based Filtering',
            detail:
              'Developed a recommendation system leveraging user preferences such as ambiance, price, and amenities to suggest relevant cafes in Malang using content-based filtering techniques.',
          },
          {
            heading: 'Natural Language Search',
            detail:
              'Enabled search functionality allowing users to find cafes using descriptive queries, such as "cafes with charging ports and spacious parking lots."',
          },
          {
            heading: 'Cross-Team Integration',
            detail:
              'Collaborated with cloud and mobile development teams to integrate the recommendation system into a mobile application for seamless user experience.',
          },
        ],
      },
      results: {
        title: 'Results',
        items: [
          'Successfully deployed a content-based cafe recommendation system',
          'Enabled natural language search for intuitive cafe discovery',
          'Integrated into a mobile app as part of Bangkit Capstone project',
        ],
      },
      techStack: {
        title: 'Tech Stack',
        items: ['Python', 'TensorFlow', 'NLP', 'Google Cloud', 'Mobile Integration'],
      },
      github: 'https://github.com/Bangkit-Capstone-C23-PS256',
    },

    crypto: {
      title: 'Crypto & Stock Market Screener',
      subtitle: 'AI Consultancy & Sentiment Analysis Dashboard',
      color: 'purple',
      usecase: {
        title: 'Use Case',
        content:
          'Investors and traders need real-time market data combined with sentiment analysis to make informed decisions. Traditional dashboards lack AI-powered insights that can analyze chart patterns and provide actionable recommendations based on market sentiment and trends.',
      },
      approach: {
        title: 'Approach',
        items: [
          {
            heading: 'Real-Time Dashboard',
            detail:
              'Built a Streamlit-based dashboard to display real-time stock and cryptocurrency market charts alongside sentiment analysis for selected assets.',
          },
          {
            heading: 'AI Market Analysis Agent',
            detail:
              'Integrated an AI agent to analyze market charts and provide actionable insights and recommendations based on sentiment and trends.',
          },
          {
            heading: 'Data Visualization Pipeline',
            detail:
              'Designed the system to process and visualize real-time data, enhancing decision-making for users through intuitive charts and metrics.',
          },
        ],
      },
      results: {
        title: 'Results',
        items: [
          'Delivered a real-time market screening dashboard with live chart updates',
          'Integrated AI-powered sentiment analysis for market assets',
          'Provided actionable insights through automated chart pattern analysis',
        ],
      },
      techStack: {
        title: 'Tech Stack',
        items: ['Python', 'Streamlit', 'yFinance', 'AI/LLM', 'Sentiment Analysis', 'Data Visualization'],
      },
      github: 'https://github.com/Valerie6048/yfinance-project',
    },
  },

  id: {
    genai: {
      title: 'Generative AI & Kecerdasan Klinis',
      subtitle: 'Solusi Healthcare Berbasis RAG',
      color: 'blue',
      usecase: {
        title: 'Studi Kasus',
        content:
          'Di domain healthcare dan riset klinis, para profesional menghadapi tantangan dalam mencocokkan pasien dengan uji klinis yang sesuai, mengekstrak data terstruktur dari eCRF yang kompleks, dan melakukan grading Adverse Events secara akurat. Tugas-tugas ini memakan waktu, rawan kesalahan, dan membutuhkan keahlian domain yang mendalam.',
      },
      approach: {
        title: 'Pendekatan',
        items: [
          {
            heading: 'Clinical Trial Matching System (CTMS)',
            detail:
              'Merancang arsitektur sistem untuk onkologi menggunakan Retrieval-Augmented Generation (RAG) dikombinasikan dengan penalaran SLM/LLM untuk mengoptimalkan pencocokan pasien-uji klinis.',
          },
          {
            heading: 'Ekstraksi Data eCRF',
            detail:
              'Mengembangkan pipeline otomatis untuk mengekstrak data dari Clinical Research Forms (eCRF) ke format JSON terstruktur yang dioptimalkan untuk rendering HTML.',
          },
          {
            heading: 'Mesin Rekomendasi Adverse Events',
            detail:
              'Membangun mesin rekomendasi context-aware untuk CTCAE menggunakan RAG dan LLM untuk memberikan penalaran klinis yang presisi dan saran grading.',
          },
          {
            heading: 'Asesmen Model Multimodal',
            detail:
              'Melakukan asesmen dukungan modalitas (Teks, Gambar, Audio, Video) untuk model frontier seperti Gemini, GPT, dan Claude untuk memastikan kompatibilitas platform.',
          },
        ],
      },
      results: {
        title: 'Hasil',
        items: [
          'Mengurangi waktu pencocokan pasien-uji klinis secara signifikan melalui retrieval berbasis RAG',
          'Menghilangkan entri data eCRF manual dengan pipeline ekstraksi JSON otomatis',
          'Memberikan rekomendasi grading CTCAE yang akurat dengan penalaran klinis kontekstual',
          'Memvalidasi kompatibilitas multimodal di 3 platform LLM utama (Gemini, GPT, Claude)',
        ],
      },
      techStack: {
        title: 'Tech Stack',
        items: ['Python', 'RAG', 'LLM / SLM', 'Azure AI Foundry', 'NLP', 'Vector Databases', 'Gemini / GPT / Claude', 'FastAPI'],
      },
    },

    predictive: {
      title: 'Pemodelan Prediktif & Marketing Science',
      subtitle: 'Forecasting & Optimasi Budget',
      color: 'purple',
      usecase: {
        title: 'Studi Kasus',
        content:
          'Tim marketing membutuhkan forecasting permintaan yang akurat untuk merencanakan kampanye, mengalokasikan budget secara efisien, dan memperhitungkan variasi musiman seperti Ramadhan. Model tradisional sering gagal menangkap nuansa ini.',
      },
      approach: {
        title: 'Pendekatan',
        items: [
          {
            heading: 'Time-Series Forecasting dengan Guardrails',
            detail:
              'Membangun model forecasting time-series dengan guardrail output terintegrasi dan rentang probabilistik (P10, P50, P90) untuk memastikan output bisnis yang realistis.',
          },
          {
            heading: 'Optimasi Musim Ramadhan',
            detail:
              'Mengoptimalkan akurasi forecasting untuk periode seasonalitas tinggi, khususnya dampak Ramadhan melalui hyperparameter tuning dan penyesuaian seasonalitas.',
          },
          {
            heading: 'Alokasi Budget Marketing',
            detail:
              'Mengembangkan model ML untuk alokasi budget marketing menggunakan regresi dan optimasi Bayesian untuk memaksimalkan performa lintas channel.',
          },
        ],
      },
      results: {
        title: 'Hasil',
        items: [
          'Menghasilkan forecast probabilistik dengan band P10/P50/P90 untuk pengambilan keputusan bisnis',
          'Meningkatkan akurasi forecasting selama musim Ramadhan',
          'Mengoptimalkan alokasi budget marketing di berbagai channel menggunakan optimasi Bayesian',
          'Memberikan insight actionable untuk perencanaan kampanye berbasis data',
        ],
      },
      techStack: {
        title: 'Tech Stack',
        items: ['Python', 'XGBoost', 'CatBoost', 'Scikit-learn', 'Bayesian Optimization', 'Pandas', 'Azure ML Platform', 'BigQuery'],
      },
    },

    mlops: {
      title: 'Infrastruktur & MLOps',
      subtitle: 'Layanan Cloud AI & Pipeline Data',
      color: 'green',
      usecase: {
        title: 'Studi Kasus',
        content:
          'Menskalakan solusi AI membutuhkan infrastruktur yang robust untuk pelacakan biaya, analisis konten video, dan pipeline data otomatis. Tanpa tooling yang tepat, tim tidak memiliki visibilitas terhadap biaya layanan AI.',
      },
      approach: {
        title: 'Pendekatan',
        items: [
          {
            heading: 'Mesin Kalkulasi Biaya Azure AI',
            detail:
              'Membangun mesin kalkulasi biaya internal untuk estimasi biaya token, video, dan storage untuk layanan Azure AI, memberikan transparansi penggunaan yang granular.',
          },
          {
            heading: 'Analisis Konten Video',
            detail:
              'Mengimplementasikan analisis konten video dan deduplikasi kreatif menggunakan Azure Video Indexer dan Computer Vision API.',
          },
          {
            heading: 'Pipeline Data Produksi',
            detail:
              'Merancang dan mengimplementasikan pipeline data end-to-end untuk lingkungan produksi, menangani proses ETL dari ingesti data mentah hingga feature store.',
          },
        ],
      },
      results: {
        title: 'Hasil',
        items: [
          'Menyediakan transparansi biaya granular untuk layanan Azure AI',
          'Mengotomatisasi analisis konten video dan deduplikasi',
          'Membangun pipeline data produksi yang reliable untuk workflow ML end-to-end',
          'Memungkinkan keputusan infrastruktur berbasis data melalui monitoring komprehensif',
        ],
      },
      techStack: {
        title: 'Tech Stack',
        items: ['Python', 'Azure Video Indexer', 'Azure Computer Vision', 'Azure Blob Storage', 'Azure Functions', 'Azure ML Platform', 'Docker', 'PostgreSQL'],
      },
    },

    cafe: {
      title: 'Sistem Rekomendasi Kafe',
      subtitle: 'Content-Based Filtering untuk Kafe Lokal',
      color: 'blue',
      usecase: {
        title: 'Studi Kasus',
        content:
          'Menemukan kafe yang tepat di Malang yang sesuai dengan preferensi spesifik — seperti ambiance, kisaran harga, fasilitas (charging port, parkir luas, tema industrial) — bisa menjadi tantangan.',
      },
      approach: {
        title: 'Pendekatan',
        items: [
          {
            heading: 'Content-Based Filtering',
            detail: 'Mengembangkan sistem rekomendasi menggunakan preferensi pengguna seperti ambiance, harga, dan fasilitas.',
          },
          {
            heading: 'Pencarian Natural Language',
            detail: 'Mengaktifkan fungsi pencarian menggunakan query deskriptif, seperti "kafe dengan charging port dan parkir luas."',
          },
          {
            heading: 'Integrasi Lintas Tim',
            detail: 'Berkolaborasi dengan tim cloud dan mobile untuk mengintegrasikan sistem ke dalam aplikasi mobile.',
          },
        ],
      },
      results: {
        title: 'Hasil',
        items: [
          'Berhasil men-deploy sistem rekomendasi kafe berbasis konten',
          'Mengaktifkan pencarian natural language untuk penemuan kafe yang intuitif',
          'Terintegrasi ke dalam aplikasi mobile sebagai bagian dari proyek Bangkit Capstone',
        ],
      },
      techStack: {
        title: 'Tech Stack',
        items: ['Python', 'TensorFlow', 'NLP', 'Google Cloud', 'Integrasi Mobile'],
      },
      github: 'https://github.com/Bangkit-Capstone-C23-PS256',
    },

    crypto: {
      title: 'Screener Kripto & Pasar Saham',
      subtitle: 'Dashboard Konsultasi AI & Analisis Sentimen',
      color: 'purple',
      usecase: {
        title: 'Studi Kasus',
        content:
          'Investor dan trader membutuhkan data pasar real-time yang dikombinasikan dengan analisis sentimen untuk membuat keputusan yang tepat.',
      },
      approach: {
        title: 'Pendekatan',
        items: [
          {
            heading: 'Dashboard Real-Time',
            detail: 'Membangun dashboard berbasis Streamlit untuk menampilkan chart pasar saham dan kripto secara real-time.',
          },
          {
            heading: 'Agen Analisis Pasar AI',
            detail: 'Mengintegrasikan agen AI untuk menganalisis chart pasar dan memberikan insight serta rekomendasi actionable.',
          },
          {
            heading: 'Pipeline Visualisasi Data',
            detail: 'Merancang sistem untuk memproses dan memvisualisasikan data real-time untuk pengambilan keputusan yang lebih baik.',
          },
        ],
      },
      results: {
        title: 'Hasil',
        items: [
          'Menghasilkan dashboard screening pasar real-time dengan pembaruan chart live',
          'Mengintegrasikan analisis sentimen berbasis AI untuk aset pasar',
          'Memberikan insight actionable melalui analisis pola chart otomatis',
        ],
      },
      techStack: {
        title: 'Tech Stack',
        items: ['Python', 'Streamlit', 'yFinance', 'AI/LLM', 'Analisis Sentimen', 'Visualisasi Data'],
      },
      github: 'https://github.com/Valerie6048/yfinance-project',
    },
  },
};
