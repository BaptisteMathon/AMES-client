import dayjs from 'dayjs';

// Vérifie si c'est le week-end
export const isWeekend = (date) => {
    const day = dayjs(date).day();
    return day === 0 || day === 6; // 0 = Dimanche, 6 = Samedi
};

// Génère un tableau des jours ouvrés entre deux dates
export const generateWorkingDays = (startDate, endDate) => {
    let days = [];
    let currentDate = dayjs(startDate);
    const end = dayjs(endDate);

    while (currentDate.isBefore(end) || currentDate.isSame(end, 'day')) {
        if (!isWeekend(currentDate)) {
            days.push(currentDate.format('YYYY-MM-DD'));
        }
        currentDate = currentDate.add(1, 'day');
    }
    return days;
};

// Calcule le nombre de jours ouvrés entre deux dates (pour déduire la durée)
export const getBusinessDaysDiff = (startDate, endDate) => {
    let count = 1; // On compte le jour de départ
    let currentDate = dayjs(startDate);
    const end = dayjs(endDate);

    // Sécurité si les dates sont inversées
    if (currentDate.isAfter(end, 'day')) return 1;

    while (currentDate.isBefore(end, 'day')) {
        currentDate = currentDate.add(1, 'day');
        if (!isWeekend(currentDate)) {
            count++;
        }
    }
    return count;
};

// Ajoute des jours ouvrés à une date (pour trouver la date de fin d'une tâche)
export const addBusinessDays = (startDate, durationInDays) => {
    let currentDate = dayjs(startDate);
    let addedDays = 1; // Le jour de début compte comme le 1er jour

    // Tant qu'on n'a pas ajouté la durée totale...
    while (addedDays < durationInDays) {
        currentDate = currentDate.add(1, 'day'); // On avance d'un jour

        // Si ce n'est pas un week-end, on incrémente notre compteur de jours ajoutés
        if (!isWeekend(currentDate)) {
            addedDays++;
        }
    }

    return currentDate.format('YYYY-MM-DD');
};