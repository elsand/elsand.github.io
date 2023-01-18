---
---
```jsonc
// Listemodell som brukes i dialogboks-søk. Presis paginering er antagelig ikke mulig pga. behov for individuell 
// autorisasjon per dialog, men det burde være en eller annen "next"-mekanisme som lar et SBS iterere gjennom en liste.
[
    {
        "id": "e0300961-85fb-4ef2-abff-681d77f9960e",
        "org": "digdir",
        "serviceName": "example_dialogue_service",
        "externalReference": "someReference",
        "party": "12018212345",        
        "dates": {
            "createdDateTime": "2022-12-01T10:00:00.000Z",
            "updatedDateTime": "2022-12-01T10:00:00.000Z",
            "dueDateTime": "2022-12-01T12:00:00.000Z"  
        },
        "detailsUrl": "/dialogporten/api/v1/e0300961-85fb-4ef2-abff-681d77f9960e"
    }
]
```