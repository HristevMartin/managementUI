export function mapIataCodeToCity(airportCode: any) {
    const airportMap = airportCode.reduce((acc: any, item: any) => {
        acc[item.iataCode] = item.name;
        return acc;
    }, {});

    Object.entries(airportMap).forEach(([key, value]: any) => {
        try {
            const firstWord = value.split(" ")[0];
            airportMap[key] = firstWord || "London";
        } catch (error) {
            airportMap[key] = "London";
        }
    });

    let airportList = Object.values(airportMap);
    console.log('airportlist', airportList);

    return [airportMap, airportList];
    return [airportMap, airportList];
}