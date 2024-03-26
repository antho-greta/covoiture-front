import Page from "../../components/Page";
import {useEffect, useState} from "react";
import {accountService} from "@/services/account.service.tsx";
import axios from "axios";
import {Link} from "react-router-dom";
import {Card, CardContent, CardFooter} from "@/components/ui/card.tsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowRight} from "@fortawesome/free-solid-svg-icons";
import Modal from "@/components/Modal";
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

interface Person {
    id: number;
    login: string;
    prenom: string;
    nom: string;
    telephone: string;
    email: string;
    ville: string;
    cdp: string;
}

function YourTrips() {
    const [personData, setPersonData] = useState<Person | null>(null);
    const [personId, setPersonId] = useState(0);
    const [data, setData] = useState<Trip[] | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
    const handleOpenModal = ((trip: Trip) => {
        setSelectedTrip(trip);
        setIsModalOpen(true);
    });
    const handleCloseModal = (() => {
        setIsModalOpen(false);
    });

    /**
     * On récupère les informations de l'utilisateur connecté et ses différents trajets
     */
    useEffect(() => {
        const token = accountService.isLogged() ? localStorage.getItem('token') : '';
        axios({
            method: 'get',
            url: 'http://localhost:8000/api/person/info',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            /**
             * On récupère les trajets en tant que conducteur
             */
            .then((response) => {
                setPersonData(response.data);
                setPersonId(response.data.id);
                return axios({
                    method: 'get',
                    url: `http://localhost:8000/api/trip/listTripByDriver/${response.data.id}`,
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
            })
            /**
             * On récupère les trajets en tant que passagé
             */
            .then((response) => {
                setData(response.data);
                return axios({
                    method: 'get',
                    url: `http://localhost:8000/api/trip/passenger/myTrips`,
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
            })
            .then((response) => setData(response.data))
            .catch((error) => console.log(error))
    }, [])

    const handleDelete = (id: number) => {
        const token = accountService.isLogged() ? localStorage.getItem('token') : '';
        axios({
            method: 'delete',
            url: `http://localhost:8000/api/trip/deleteTrip/${id}`,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(() => {
                setData(data?.filter((trip: Trip) => trip.id !== id))
            })
            .catch((error) => console.log(error))
    }

    return (
        <Page>
            <div className="pt-3 rounded-none w-[80%] h-[100%] cursor-pointer text-center">
                <h1 className="p-2">Mes Trajets</h1>
                {data && data.map((trip, index) => {
                    if (index === 0) return null; // On ne prend pas en compte le premier élément du tableau qui est vide
                    return (
                        <div onClick={() => handleOpenModal(trip)} key={index}>
                            <Card key={index}
                                  className="w-full border-none my-1 bg-bleuFonce hover:bg-bleuClair transition-colors duration-200">
                                <CardContent className="flex justify-between pl-4 pr-4">
                                    <div>
                                        <span>{trip["ville de départ"]}  </span>
                                        <FontAwesomeIcon icon={faArrowRight}/>
                                        <span>  {trip["ville d'arrivée"]}</span>
                                    </div>
                                    <div>
                                        <p>TODO Total distance</p>
                                    </div>
                                </CardContent>
                                <CardFooter className="justify-start pl-4">
                                    <span className="text-gray-400">{trip["date du trajet"]}</span>
                                </CardFooter>
                            </Card>
                        </div>
                    )
                })}
            </div>
            <Modal isOpen={isModalOpen} handleClose={handleCloseModal}>
                <h2>Détails du Trajet</h2>
                {selectedTrip && (
                    <div>
                        <p>Conducteur : {selectedTrip["prénom du conducteur"]}</p>
                        <p>Ville de départ : {selectedTrip["ville de départ"]}</p>
                        <p>Ville d'arrivée : {selectedTrip["ville d'arrivée"]}</p>
                        <p>Distance : {selectedTrip["distance en kilometres"]}</p>
                        <p>Date : {selectedTrip["date du trajet"]}</p>
                        <Button onClick={() => handleDelete(selectedTrip.id)}>Supprimer</Button>
                    </div>
                )}
            </Modal>
        </Page>
    )
}

export default YourTrips