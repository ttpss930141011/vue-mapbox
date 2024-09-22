// Generate random building data
export const generateRandomBuildingData = () => ({
    type: 'Residential',
    yearBuilt: Math.floor(Math.random() * (2023 - 1900 + 1)) + 1900,
    area: Math.floor(Math.random() * 200) + 50, // 50 to 250 sqm
    marketPrice: Math.floor(Math.random() * 1000000) + 100000, // 100,000 to 1,100,000 USD
    rent: Math.floor(Math.random() * 5000) + 500, // 500 to 5,500 USD/month
});
// Generate random timeline events
export const generateRandomTimelineEvents = () => {
    const events = [];
    const numberOfEvents = Math.floor(Math.random() * 5) + 1; // 1 to 5 events
    for (let i = 0; i < numberOfEvents; i++) {
        const year = Math.floor(Math.random() * (2023 - 2000 + 1)) + 2000;
        const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
        const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
        events.push({
            date: `${year}-${month}-${day}`,
            content: `Event ${i + 1}`
        });
    }
    return events;
};