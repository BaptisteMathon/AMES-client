<template>
  <div class="career-page">

    <Header />

    <main class="full-width-container">
      
      <div class="page-intro">
        <h1>Expériences Professionnelles</h1>
        <div class="title-underline-large"></div>
        <p class="intro-text">
          Un parcours riche de <span class="highlight-green">25+ années</span> d'expertise en gestion de la donnée.
        </p>
      </div>

      <div class="cards-list">
        
        <div 
          v-for="company in experiences" 
          :key="company.id" 
          class="company-card"
          :class="{ 'is-open': company.isOpen }"
        >
          
          <div class="company-header" @click="toggleCompany(company.id)">
            <div class="header-content-left">
              <div class="company-logo-box">
                <span v-if="!company.logo" class="logo-text">{{ company.name[0] }}</span>
                <img v-else :src="company.logo" :alt="company.name" class="real-logo" />
              </div>
              
              <div class="company-title-block">
                <h2 class="company-name">{{ company.name }}</h2>
                <span class="company-duration">{{ company.totalDuration }}</span>
              </div>
            </div>
            <div class="toggle-icon">
              <span class="chevron" :class="{ 'rotated': company.isOpen }">▼</span>
            </div>
          </div>

          <div v-show="company.isOpen" class="company-details-body">
            
            <div class="timeline-wrapper">

              <div 
                v-for="(role, rIndex) in company.roles" 
                :key="rIndex" 
                class="timeline-item"
              >
                
                <div class="timeline-dot"></div>

                <div class="timeline-content">
                  
                  <div class="role-header">
                    <h3 class="role-title">{{ role.title }}</h3>
                    <span class="role-dates" v-if="role.dates">{{ role.dates }}</span>
                  </div>

                  <p v-if="role.description" class="role-description">
                    {{ role.description }}
                  </p>

                  <div v-if="role.subSections && role.subSections.length" class="sub-sections-grid">
                    <div v-for="(sub, sIndex) in role.subSections" :key="sIndex" class="project-card">
                      
                      <div class="project-header">
                        <h4 class="sub-title">{{ sub.title }}</h4>
                        <span class="project-date-badge" v-if="sub.date">{{ sub.date }}</span>
                      </div>

                      <p v-if="sub.titleDesc" class="project-desc">{{ sub.titleDesc }}</p>
                      
                      <ul v-if="sub.bullets" class="fancy-list">
                        <li v-for="(bullet, bIndex) in sub.bullets" :key="bIndex">
                          {{ bullet }}
                        </li>
                      </ul>

                      <div v-if="sub.tools" class="tools-container">
                        <span class="tools-label">🛠️ Outils :</span>
                        <span 
                          v-for="tool in sub.tools.split(',')" 
                          :key="tool" 
                          class="tech-badge"
                        >
                          {{ tool.trim() }}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div> </div>

        </div>

      </div>
    </main>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import Header from './Header.vue';

const experiences = ref([
  {
    id: 1,
    name: "AMES",
    logo: "/AMES-Logo.png", 
    totalDuration: "février 2024 - aujourd'hui",
    isOpen: true,
    roles: [
      {
        title: "CEO • Gérant et fondateur",
        description: "Expérience de plus de 25 ans dans les métiers de gestion de la donnée et d'accompagnement des besoins métier.",
        subSections: [
          {
            title: "Expertises & Services Oracle EPM Cloud",
            titleDesc: "PBCS - Hyperion Planning",
            bullets: [
              "Accompagnement mise en oeuvre projets EPM",
              "Choix structurels et organisationnels",
              "Implémentation Maintenance Applicative",
              "Gestion de compte AMS"
            ]
          },
          {
            title: "Expertise & Services HR Access",
            bullets: [
              "Pilotage de projet RH, paie, Gestion Administrative",
              "Maintenance évolutive et résolution d'anomalies"
            ]
          }
        ]
      }
    ]
  },
  {
    id: 2,
    name: "Klee Performance",
    logo: "/Klee.png", 
    totalDuration: "sept. 2016 - mars 2024",
    isOpen: false,
    roles: [
      {
        title: "Responsable de Veille Technologique",
        dates: "janv. 2023 - mars 2024",
        description: "Analyse et test des nouveautés mensuelles Oracle EPM Cloud. \n👉 Publication d'une Newsletter mensuelle et capitalisation des bonnes pratiques."
      },
      {
        title: "Responsable de la Cellule Qualité",
        dates: "janv. 2023 - mars 2024",
        description: "Lancement de la Cellule Qualité pour diffuser les meilleures pratiques du marché."
      },
      {
        title: "Manager",
        dates: "avr. 2021 - mars 2024",
        description: "" 
      },
      {
        title: "Chef de projet",
        dates: "sept. 2016 - avr. 2021",
        description: "Missions d'intégration et TMA autour des solutions EPM Oracle.",
        subSections: [
          {
            title: "Projet Dalkia",
            date: "août 2018",
            titleDesc: "Initialisation de la TMA pour Klee Performance.",
            tools: "PBCS, SOA"
          },
          {
            title: "Projet IMPRIMERIE NATIONALE",
            date: "avr. 2018",
            titleDesc: "Implémentation d'un nouvel EPM pour le Compte d'Exploitation.",
            bullets: [
              "Animation ateliers conception & rédaction spécifications",
              "Flux sous FDMEE",
              "Gestion des changements",
              "Accompagnement MOA (Recette & Démarrage)"
            ],
            tools: "PBCS, Data Management, EPM Automate"
          },
          {
            title: "KIABI",
            date: "2016",
            titleDesc: "Projet de migration de l'application Planning Compte d'Exploitation et KPI.",
            bullets: [
              "Animation des ateliers de conception et de rédaction des spécifications",
              "Mise en place des flux développés sous ODI",
              "Accompagnement de la MOA lors de la recette métier"
            ],
            tools: "Hyperion Planning, ODI"
          }
        ]
      }
    ]
  },
  {
    id: 3,
    name: "Auchan",
    logo: "/Auchan.png",
    totalDuration: "fév. 2004 - août 2016",
    isOpen: false,
    roles: [
      {
        title: "Chef de projet",
        description: "Gestion de projets retail et coordination des équipes techniques."
      }
    ]
  },
  {
    id: 4,
    name: "IBM",
    logo: "/IBM.png",
    totalDuration: "1998 - 2001",
    isOpen: false,
    roles: [
      {
        title: "Chargé d'étude",
        description: "Analyse et développement de solutions informatiques."
      }
    ]
  }
]);

const toggleCompany = (id) => {
  const target = experiences.value.find(c => c.id === id);
  if (target) target.isOpen = !target.isOpen;
};
</script>

<style scoped>
/* --- VARIABLES --- */
:root {
  --header-bg: #2e7d32; 
  --primary-green: #43a047;
  --bg-page: #f8f9fa;
  --card-bg: #ffffff;
  --text-main: #2c3e50;
  --text-grey: #666;
}


/* --- RESET & LAYOUT --- */
.career-page {
  font-family: 'Segoe UI', 'Roboto', sans-serif;
  background-color: var(--bg-page);
  min-height: 100vh;
  color: var(--text-main);
}

/* CONTENT */
.full-width-container { width: 100%; padding: 40px 5%; box-sizing: border-box; }
.page-intro { margin-bottom: 50px; }
.page-intro h1 { font-size: 2.5rem; margin: 0 0 10px 0; }
.intro-text { font-size: 1.2rem; color: #555; margin-top: 15px; }
.highlight-green { color: var(--header-bg); font-weight: bold; }
.title-underline-large { width: 100%; max-width: 400px; height: 8px; background: linear-gradient(90deg, #43a047, #2e7d32); border-radius: 4px; }

/* CARTES */
.cards-list { display: flex; flex-direction: column; gap: 25px; }
.company-card { background: var(--card-bg); border-radius: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid transparent; transition: 0.3s;  }
.company-card.is-open { box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid var(--primary-green); }

/* HEADER CARTE */
.company-header { padding: 25px 30px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; background: white; }
.company-header:hover { background: #fafafa; }
.header-content-left { display: flex; align-items: center; gap: 20px; }
.company-logo-box { width: 60px; height: 60px; background: #f0f0f0; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: var(--header-bg); font-weight: bold; }
.real-logo { width: 80%; height: 80%; object-fit: contain; }
.company-name { margin: 0; font-size: 1.4rem; color: #2e7d32; }
.company-duration { color: #888; font-size: 0.9rem; }
.chevron { font-size: 1.2rem; color: #ccc; transition: 0.3s; }
.chevron.rotated { transform: rotate(180deg); color: var(--primary-green); }

/* --- TIMELINE DESIGN (C'est ici que ça change tout) --- */
.company-details-body {
  padding: 30px 40px;
  background: #fdfdfd;
  border-top: 1px solid #eee;
  animation: fadeIn 0.4s ease;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; }}

/* Le trait vertical */
.timeline-wrapper {
  position: relative;
  padding-left: 20px; /* Espace pour la ligne */
  border-left: 3px solid #e0e0e0; /* La ligne grise */
  margin-left: 10px;
}

.timeline-item {
  position: relative;
  margin-bottom: 40px; /* Espace entre les rôles */
  padding-left: 30px; /* Espace entre la ligne et le texte */
}
.timeline-item:last-child { margin-bottom: 0; }

/* Le point vert sur la ligne */
.timeline-dot {
  position: absolute;
  left: -28px; /* Ajustement pour centrer sur la ligne */
  top: 5px;
  width: 14px;
  height: 14px;
  background: white;
  border: 3px solid var(--primary-green);
  border-radius: 50%;
  z-index: 2;
}

.role-title { font-size: 1.3rem; margin: 0 0 5px 0; color: #222; font-weight: 700; }
.role-dates { font-size: 0.9rem; color: var(--primary-green); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 10px; }
.role-description { line-height: 1.7; color: #444; margin-bottom: 20px; white-space: pre-line; }

/* CARTES PROJETS / SOUS-SECTIONS */
.sub-sections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); /* Responsive grid */
  gap: 20px;
  margin-top: 20px;
}

.project-card {
  background: white;
  border: 1px solid #eee;
  border-left: 4px solid var(--primary-green); /* Accent vert */
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.03);
  transition: transform 0.2s;
}
.project-card:hover { transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.08); }

.project-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px; flex-wrap: wrap; gap: 10px;}
.sub-title { margin: 0; font-size: 1.1rem; color: #2e7d32; font-weight: 700; }
.project-date-badge { background: #e8f5e9; color: #2e7d32; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 600; }

.project-desc { font-style: italic; color: #666; font-size: 0.95rem; margin-bottom: 15px; }

/* LISTE STYLISÉE */
.fancy-list { padding-left: 0; margin: 15px 0; }
.fancy-list li {
  list-style: none;
  position: relative;
  padding-left: 20px;
  margin-bottom: 8px;
  color: #555;
  font-size: 0.95rem;
}
.fancy-list li::before {
  content: "✔"; /* Coche au lieu de puce */
  color: var(--primary-green);
  position: absolute;
  left: 0;
  font-size: 0.8rem;
  top: 2px;
}

/* BADGES OUTILS */
.tools-container { margin-top: 20px; border-top: 1px dashed #eee; padding-top: 10px; }
.tools-label { font-size: 0.85rem; color: #999; margin-right: 5px; font-weight: 600; }
.tech-badge {
  display: inline-block;
  background: #f1f8e9; /* Vert très pâle */
  color: #33691e;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-right: 5px;
  margin-bottom: 5px;
  border: 1px solid #c5e1a5;
  transition: 0.2s;
}
.tech-badge:hover { background: var(--primary-green); color: white; border-color: var(--primary-green); }


/* RESPONSIVE */
@media (max-width: 768px) {
  .company-header { padding: 15px; }
  .header-content-left { gap: 10px; }
  .company-logo-box { width: 45px; height: 45px; }
  .company-name { font-size: 1.1rem; }
  .company-details-body { padding: 20px; }
  .sub-sections-grid { grid-template-columns: 1fr; }
}
</style>