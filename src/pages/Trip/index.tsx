import React, {useCallback, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import axios from 'axios';
import {accountService} from "@/services/account.service.tsx";
import Page from '../../components/Page/index.tsx';
import {Button} from "@/components/ui/button.tsx";

interface Trip {
    id: number;
    "prénom du conducteur": string;
    "nom du conducteur": string;
    "ville de départ": string;
    "ville d'arrivée": string;
    "distance en kilometres": number;
    "nombre de place disponobles": number;
    "date du trajet": string;
}

const TripDetails: React.FC = () => {
        const {id} = useParams<{ id: string }>();
        const [trip, setTrip] = useState<Trip | null>(null);


        useEffect(() => {
            const token = accountService.isLogged() ? localStorage.getItem('token') : '';
            axios({
                method: 'get',
                url: `http://localhost:8000/api/trip/selectedTrip/${id}`,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then((response) => {
                    setTrip(response.data[1]);
                })
                .catch((error) => console.log(error))
        }, [id]);

    const handleJoin = useCallback(() => {
        const token = accountService.isLogged() ? localStorage.getItem('token') : '';
        axios({
            method: 'post',
            url: `http://localhost:8000/api/trip/passenger/joinTrip/${id}`,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then((response) => {
                console.log(trip);
                setTrip(response.data[1]);
                alert("Vous avez rejoint le trajet avec succès");
            }).catch((error) => {
            console.log(error);
            if(error.response && error.response.data && error.response.data.error){
                alert(error.response.data.error);
            }else{
                alert("Erreur lors de la jointure du trajet");
            }

        })
    }, [id, trip]);

        return (
            <Page>
                {trip && (
                    <div>
                        <h1>Détails du Trajet</h1>
                        <p>Conducteur: {trip["prénom du conducteur"]} {trip["nom du conducteur"]}</p>
                        <p>Ville de départ: {trip["ville de départ"]}</p>
                        <p>Ville d'arrivée: {trip["ville d'arrivée"]}</p>
                        <p>Distance: {trip["distance en kilometres"]} km</p>
                        <p>Places disponibles: {trip["nombre de place disponobles"]}</p>
                        <p>Date du trajet: {trip["date du trajet"]}</p>
                    </div>
                )}
                <Button onClick={() => handleJoin()}>Rejoindre le trajet</Button>
            </Page>
        );
    }
;

export default TripDetails;