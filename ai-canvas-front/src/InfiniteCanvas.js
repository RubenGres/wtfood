import MyCanvas from './MyCanvas';
import React, {useEffect, useState} from "react";
import SideBar from "./SideBar";
import HeaderAppBar from "./headerAppBar/HeaderAppBar";
import {TourProvider} from "@reactour/tour";
import {useSearchParams} from "react-router-dom";

const InfiniteCanvas = (props) => {

    const [sidebarOpen, setSideBarOpen] = useState(false);
    const handleViewSidebar = () => {
        setSideBarOpen(!sidebarOpen);
    };

    const [modifiers, setModifiers] = useState({positive:"", negative:"lowres, blurry"})
    const [history, setHistory] = useState([])

    const [isLogged, setIsLogged] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [credential, setCredential] = useState('');

    const [searchParams, setSearchParams] = useSearchParams();
    const [room, setRoom] = useState(searchParams.get("room") !== null ? searchParams.get("room") : (localStorage.getItem('cur_room') !== null) ? localStorage.getItem('cur_room') : "default");

    const [camera, setCamera] = useState({
        x: searchParams.get("x") !== null ? parseInt(searchParams.get("x")) : (localStorage.getItem('cur_posX') !== null) ? parseInt(localStorage.getItem('cur_posX')) : 0,
        y: searchParams.get("y") !== null ? parseInt(searchParams.get("y")) : (localStorage.getItem('cur_posY') !== null) ? parseInt(localStorage.getItem('cur_posY')) : 0,
        zoom: searchParams.get("zoom") !== null ? parseInt(searchParams.get("zoom")) / 100 : (localStorage.getItem('cur_zoom') !== null) ? parseInt(localStorage.getItem('cur_zoom')) / 100 : 1,
       
        move: (x, y, zoom) => {
            setCamera(prevState => {
                return {
                    x: x,
                    y: y,
                    zoom: zoom,
                    move: prevState.move
                }
            })
        }
    })

    const [colabLink, setColabLink] = useState("");



    const tourSteps = [
        {
            selector: ".HelpButton",
            content: "Welcome to Koll.ai Infinite Canvas! Take a tour or click the cross to exit (you can show me later by click this button)"
        },
        {
            selector: ".ImageCanvas",
            content: "This is the canvas where all images are displayed, you can explore it and zoom in / out"
        },
        {
            selector: ".ModeSelectionButtons",
            content: "Here you can switch to selection mode to generate an image (Require login)"
        },
        {
            selector: ".RoomTabs",
            content: "Here you can switch between rooms or access a private room"
        },
        {
            selector: ".ButtonCoordModal",
            content: "Click the current position to get a shareable link to you current room and position"
        },
        {
            selector: ".sidebar-toggle",
            content: "The sidebar allows you to add prompt modifier and to see image generated in this session"
        },
        {
            selector: ".ProfilButton",
            content: "Start generating now by singing-in in one click!"
        },
        {
            selector: ".ChoiceButtons",
            content: "You can choose between multiple actions"
        },
        {
            selector: ".NewImageButton",
            content: "**New Image** Generate a new image from scratch"
        },
        {
            selector: ".OutpaintingButton",
            content: "**Outpainting** Only generate empty parts in the selection for seamless effect"
        },
        {
            selector: ".Img2imgButton",
            content: "**Image To Image** Start the generation with the selection as init image"
        },
        {
            selector: ".SaveButton",
            content: "**Save** Download the selection as jpeg"
        },
        {
            selector: ".GenerationHelpButton",
            content: "**Help** Display this help"
        }
    ]


    const [canvasMeta, setCanvasMeta] = useState({
        w: window.innerWidth,
        h: window.innerHeight
    })

    useEffect(() => {
        const onPageLoad = () => {
            setIsMobile(window.innerWidth <= 768);
        }

        const onPageResize = () => {
            // setCanvasMeta({
            //     w: window.innerWidth,
            //     h: window.innerHeight,
            // });
        }
        window.addEventListener("resize", onPageResize);
        window.addEventListener("load", onPageLoad);
    })




    return (
        <>
                <meta name="viewport"
                      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
                <MyCanvas
                    camera={camera}
                    modifiers={modifiers}
                    setHistory={setHistory}
                    history={history}
                    isLogged={isLogged}
                    credential={credential}
                    isMobile={isMobile}
                    room={room}
                    canvasMeta={canvasMeta}
                    setModifiers={setModifiers}
                    colabLink={colabLink}

                />
        </>
    );
}

export default InfiniteCanvas;