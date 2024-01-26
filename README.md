<div align="center"> <a href="https://brz-chatbot.vercel.app/"> <img src="https://brz-chatbot.vercel.app/opengraph-image.png" alt="BRZ Chatbot"> </a> <h1>Bundesrechenzentrum Chatbot</h1> </div> <p align="center">  Open-Source-Chatbot, entwickelt mit NextJS 14, unterstützt durch OpenAI/LocalAI/HF Inference API, QDrant & LangChainJS. </p> <p align="center"> <a href="#features"><strong>Features</strong></a> · <a href="#model-provider"><strong>Modellanbieter</strong></a> · <a href="#lokal-nutzen"><strong>Lokale Nutzung</strong></a> </p> <br/>

Features
--------

*   **Echtzeit-Zugriff** auf die [BRZ-Jobs-Website](https://www.brz-jobs.at/Jobs).
*   Bereitstellung von **Kontextinformationen** von der [offiziellen BRZ-Website](https://brz.gv.at/).
*   Unterstützung für **mehrere AI-Modelle**: OpenAI (Standard), LocalAI, Ollama, Hugging Face\*\*.
*   **Keine Datenbank erforderlich**: Alle Daten (Chats, Einstellungen) werden lokal im LocalStorage gespeichert.
*   Zugriff auf über **6000 referenzierbare Vektoren**, basierend auf der [BRZ-Website](https://brz.gv.at/). 

> **Hinweis:** Das Modell muss mit [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling) kompatibel sein.

Modellanbieter
--------------

Standardmäßig ist GPT-3.5-Turbo als AI-Modell eingestellt. Es ist jedoch möglich das Modell durch folgende Einstellungen zu ändern.

*   **API-Server-URL** unter `Dashboard -> Einstellungen -> API Server URL`
*   **Modellname** unter `Dashboard -> Einstellungen -> Modell Name`

> Wichtig: Um alle Funktionen des Chatbots vollständig nutzen zu können, muss das gewählte Modell [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling) unterstützen.

Lokale Nutzung
--------------

Befolge diesen Schritte, um den Chatbot lokal zu nutzen:

1.  **Repository klonen:** `git clone https://github.com/Julian-AT/brz-chatbot` oder als ZIP herunterladen und extrahieren.
2.  **Ins Verzeichnis wechseln** und `npm install` ausführen.
3.  **Environment-Variablen setzen:** Alle erforderlichen Variablen sind in `.env.example`.
4.  **Server starten:** Mit dem Befehl `npm run dev` starten.
5.  **Zugriff auf die App:** Die App ist nun unter [localhost:3000](http://localhost:3000/) erreichbar.

> Achtung: Die `.env`\-Datei sollte niemals in einem öffentlichen Repository veröffentlicht werden.