import React, {useEffect, useRef, useState} from 'react';
import {Layer, Rect, Stage} from 'react-konva';
import {createSearchParams, useSearchParams} from "react-router-dom";
import URLImage from './URLImage';
import PromptRect from './promptRect';
import LoadPlaceholder from './LoadPlaceholder';
import ImageSaverLayer from './imageSaveLayer';
import Amplify from '@aws-amplify/core'
import * as gen from './generated'
import HelpModalButton from './helpModal'
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {useAuthState} from 'react-firebase-hooks/auth';
import {auth} from './auth/Auth';
// import ImageSaver from './ImageSaver';
// import * as env from './env.js';
import {CONNECTION_STATE_CHANGE} from '@aws-amplify/pubsub';
import {Hub} from 'aws-amplify';
import RefreshIcon from '@mui/icons-material/Refresh';
import {Fab} from "@mui/material";
import Box from "@mui/material/Box";
import PanToolIcon from '@mui/icons-material/PanTool';
import HighlightAltIcon from '@mui/icons-material/HighlightAlt';
import CoordsModal from "./coordsModal";
import {useTour} from "@reactour/tour";
import MyDrawer from "./headerAppBar/MyDrawer"

Amplify.configure(gen.config)


const URL_BUCKET = "https://storage.googleapis.com/aicanvas-public-bucket/"

// const URL_START_VM = "https://function-start-vm-jujlepts2a-ew.a.run.app"
// const URL_STOP_VM = "https://function-stop-jujlepts2a-ew.a.run.app"
// const URL_STATUS_VM = "https://function-get-status-gpu-jujlepts2a-ew.a.run.app"

const BACK_BASE_URL = process.env.REACT_APP_BACK_URL;

const URL_GET_IMAGES = BACK_BASE_URL + '/get_images_for_room/'
const URL_FUNCTION_IMAGEN = BACK_BASE_URL + "/imagen/"
const URL_FUNCTION_UPDATE_PSEUDO = BACK_BASE_URL + "/update_user_pseudo/"

//modes
const EDIT = "EDIT";
const VIEW = "VIEW";

//states
const IDLE = "IDLE";
const SELECT = "SELECT";
const PROMPT = "PROMPT";
const MOVE = "MOVE";
const CHOOSE_TYPE = "CHOOSE_TYPE";

//camera speed
const CAMERA_ZOOM_SPEED = 1.1;
const MIN_ZOOM = 0.01;
const MAX_ZOOM = 1;

let generation_type;
let cursor_pos = [0, 0];

const MyCanvas = (props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const stageRef = useRef(null);
  const imageLayerRef = useRef(null);
  const imageSaveRef = useRef(null);

  const [imageSave, setImageSave] = useState(null);

  const [currentMode, setCurrentMode] = useState(VIEW);
  const [currentState, setCurrentState] = useState(IDLE);

  const [selectRect, setSelectRect] = useState({
    x: 0,
    y: 0,
    w: 0,
    h: 0
  })

  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const [selectionRect, setSelectionRect] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0
  })

  const [cursor, setCursor] = useState('default');

  const [canvasMeta, setCanvasMeta] = useState({
    w: window.innerWidth,
    h: window.innerHeight
  })

  //camera
  let camera = props.camera;
  let room = props.room;
  // let oneClickControls = props.isMobile;
  let oneClickControls = true;

  const [camInitX, setCamInitX] = useState(0);
  const [camInitY, setCamInitY] = useState(0);
  const [cameraX, setCameraX] = useState(0);
  const [cameraY, setCameraY] = useState(0);
  const [cameraZoom, setCameraZoom] = useState(1);

  const [imageDivList, setImageDivList] = useState([]);
  const [placeholderList, setPlaceholderList] = useState(new Map());

  //mobile
  const [touchesDist, setTouchesDist] = React.useState(Infinity);
  const [cameraZoomStart, setCameraZoomStart] = React.useState(1);

  const [user, loading, error] = useAuthState(auth);
  const {setIsOpen, currentStep, isOpen, setCurrentStep} = useTour()




//   Refresh client token
  useEffect(()=>{
      const interval = setInterval(() => {
          if (user){
            const expiration_time = user.stsTokenManager.expirationTime;
            if (Date.now() > expiration_time){
                    console.log('Refreshing token');
                    user.getIdToken(true)
                }
        }

          
      }, 10 * 1000)
  })


  useEffect(() => {
    let initial_tour_done = localStorage.getItem("initial_tour_done")
    if (initial_tour_done === null) {
      setIsOpen(true);
      localStorage.setItem("initial_tour_done", true)
    }
  }, []);


  function onClickImage(prompt){
      console.log(user)
      toast.info(<div onClick={() => {
        navigator.clipboard.writeText(prompt)
        toast.success(<p>Prompt copied to clipboard</p>, {
            position: "bottom-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
      
        })
      }}>

      Prompt: {prompt}
    </div >, {
      position: "bottom-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }


  function handle_receive_from_socket(data) {
    data = JSON.parse(data)

    var z = Math.min(canvasMeta.w / +data.width, canvasMeta.h / +data.height) * 0.5;
    var x = +data.posX - (canvasMeta.w / 2) / z + +data.width / 2
    var y = +data.posY - (canvasMeta.h / 2) / z + +data.height / 2

    if (data.action === "new_image") {
      removePlaceholder(data.posX, data.posY)
      addNewImage(URL_BUCKET + data.path, data.posX, data.posY, data.width, data.height, data.prompt)
      props.setHistory(prevState => [...prevState, data])

      toast(<div onClick={() => { camera.move(x, y, z) }}>

        New image: {data.prompt} at ({data.posX}, {data.posY})
      </div >, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }

    if (data.action === "generating_image") {
      console.log(data.queue_size)
      addNewPlaceholder(data.posX, data.posY, data.width, data.height)
    }

    if (data.action === "unsafe_image") {
      removePlaceholder(data.posX, data.posY)

      toast(<div onClick={() => {
        camera.move(x, y, z)
      }}>

        Unsafe Image : {data.prompt} at ({data.posX}, {data.posY})
      </div>, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

    }
  }

  //socket
  useEffect(() => {
    const subscription = gen.subscribe(room, ({ data }) => handle_receive_from_socket(data),
      (error) => console.warn(error))
    return () => subscription.unsubscribe()
  }, [room])


  Hub.listen('api', (data) => {
    const { payload } = data;
    if (payload.event === CONNECTION_STATE_CHANGE) {
      const connectionState = payload.data.connectionState;
      console.log(connectionState);
    }
  });


  //on page load
  useEffect(() => {
    const onPageLoad = () => {
      const onPageResize = () => {
        setCanvasMeta({
          w: window.innerWidth,
          h: window.innerHeight,
        });
      }

      window.addEventListener("resize", onPageResize);

      var x = searchParams.get("x") !== null ? +searchParams.get("x") : 0;
      var y = searchParams.get("y") !== null ? +searchParams.get("y") : 0;
      var zoom = searchParams.get("zoom") !== null ? +searchParams.get("zoom") / 100 : 1;

      // var room = searchParams.get("room") !== null ? searchParams.get("room") : "default";
      // setRoom(room);

      handleClickRefresh();

    //   camera.move(x, y, zoom);
    };

    window.addEventListener('contextmenu', event => event.preventDefault());

    // Check if the page has already loaded
    if (document.readyState === "complete") {
      onPageLoad();
    } else {
      window.addEventListener("load", onPageLoad);
      // Remove the event listener when component unmounts
      return () => {
        window.removeEventListener("load", onPageLoad);
      }
    }
  }, [room]);

  function switchMode(mode) {
    switchState(IDLE);
    switch (mode) {
      case EDIT:
        if (!user) {
          toast.error('You must be connected to use edit mode', {
            position: "bottom-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
          return;
        }
        break;

      case VIEW:
        hideSelectionRect();
        break;

      default:
    }

    setCurrentMode(mode);
  }

  function switchState(state) {
    switch (state) {
      case IDLE:
        setCursor('default');
        break;

      case MOVE:
        setCursor('grabbing');
        break;

      case SELECT:
        setCursor('crosshair');
        break;

      case PROMPT:
        setCursor('default');
        break;

      case CHOOSE_TYPE:
        setCursor('default');

        //set rect new position
        if (width < 0) {
          setPosX(posX + width);
          setWidth(Math.abs(width));
        }

        if (height < 0) {
          setPosY(posY + height);
          setHeight(Math.abs(height));
        }
        break;

      default:
    }

    setCurrentState(state);
  }

  function setSearchParam() {
    setSearchParams(
      createSearchParams({ room: room, x: Math.round(camera.x), y: Math.round(camera.y), zoom: Math.round(camera.zoom * 100) })
    );
  }

  // convert coordinates system
  function toGlobalSpace(x, y) {
    x = +camera.x + +x / camera.zoom;
    y = +camera.y + +y / camera.zoom;

    return [x, y]
  }

  function toRelativeSpace(x, y) {
    x = (x - camera.x) * camera.zoom;
    y = (y - camera.y) * camera.zoom;
    return [x, y]
  }

  // true if rectangle a and b overlap
  function overlap(a, b) {
    if (a.x >= b.x + b.w || b.x >= a.x + a.w) return false;
    if (a.y >= b.y + b.h || b.y >= a.y + a.h) return false;
    return true;
  }

  // define a new selection
  function defineSelection(x, y) {
    [x, y] = toGlobalSpace(x, y);

    setPosX(x);
    setPosY(y);
    setWidth(0);
    setHeight(0);
  }

  function hideSelectionRect() {
    setPosX(Number.MAX_SAFE_INTEGER);
    setPosY(Number.MAX_SAFE_INTEGER);
    setWidth(0);
    setHeight(0);
  }

  function addNewPlaceholder(x, y, w, h) {
    var ph = {
      type: 'placeholder',
      x: x,
      y: y,
      w: w,
      h: h
    };

    setPlaceholderList(prevState => {
      var copy = new Map(prevState);
      copy.set(`${x},${y}`, ph);
      return copy;
    });

  }

  function removePlaceholder(x, y) {
    setPlaceholderList(prevState => {
      var copy = new Map(prevState);

      if (copy.has(`${x},${y}`))
        copy.delete(`${x},${y}`);

      return copy;
    });
  }

  function addNewImage(src, x, y, w, h, prompt) {
    var img = {
      type: 'image',
      src: src,
      x: x,
      y: y,
      w: w,
      h: h,
      prompt: prompt
    };

    //add last
    setImageDivList(prevState => [...prevState, img]);

    //add first
    // setImageDivList(prevState => [img, ...prevState]);
    // setImageDivList([img])

    //add to history
    props.setHistory(prevState => [ {posX:x, posY:y, width:w, height:h, prompt:prompt}, ...prevState,])

  }

  function handleDown() {
    switch (currentMode) {
      case VIEW:
        setCamInitX(cursor_pos[0]);
        setCamInitY(cursor_pos[1]);

        switchState(MOVE);
        break;

      case EDIT:
        defineSelection(cursor_pos[0], cursor_pos[1]);
        switchState(SELECT);
        break;

      default:
    }
  }

  function handleMove() {
    switch (currentMode) {
      case VIEW:
        if (currentState === MOVE) {
          var movX = cursor_pos[0] - camInitX;
          var movY = cursor_pos[1] - camInitY;

          setCamInitX(cursor_pos[0]);
          setCamInitY(cursor_pos[1]);

          camera.move((camera.x - movX / camera.zoom), (camera.y - movY / camera.zoom), camera.zoom);
        }
        break;

      case EDIT:
        if (currentState === SELECT) {
          var w = (cursor_pos[0] / camera.zoom + camera.x - posX);
          var h = (cursor_pos[1] / camera.zoom + camera.y - posY);
          setWidth(w);
          setHeight(h);
        }
        break;

      default:
    }
  }

  function handleUp() {
    switch (currentMode) {
      case VIEW:
        // setSearchParam();
        switchState(IDLE);
        break;

      case EDIT:
        if (currentState === SELECT) {
          switchState(CHOOSE_TYPE);
          // Display automaticaly the tour helper
          let initial_tour_done = localStorage.getItem("generation_tour_done")
          if (initial_tour_done === null) {
            setCurrentStep(7);
            setIsOpen(true);
            localStorage.setItem("generation_tour_done", true)
          }
        }
        break;

      default:
    }
  }

  // movement handlers
  const handleTouchDown = (e) => {
    if (e.evt.touches.length === 2) {
      var touch1 = e.evt.touches[0];
      var touch2 = e.evt.touches[1];

      var dist = Math.sqrt(Math.pow(touch1.clientX - touch2.clientX, 2) + Math.pow(touch1.clientY - touch2.clientY, 2))

      setTouchesDist(dist);
      setCameraZoomStart(camera.zoom);
      return;
    }

    var touchposx = e.evt.touches[0].clientX;
    var touchposy = e.evt.touches[0].clientY;
    cursor_pos = [touchposx, touchposy];
    handleDown();
  }

  const handleMouseDown = (e) => {
    cursor_pos = [e.evt.clientX, e.evt.clientY];
    if (oneClickControls) {
      handleDown();
      return;
    }

    if (e.evt.which === 1) {
      defineSelection(cursor_pos[0], cursor_pos[1]);
      switchMode(EDIT);
      switchState(SELECT);
    } else if (e.evt.which === 3) {
      setCamInitX(cursor_pos[0]);
      setCamInitY(cursor_pos[1]);
      switchMode(VIEW);
      switchState(MOVE);
    }
  }

  const handleTouchMove = (e) => {
    if (e.evt.touches.length === 1) {
      var touchposx = e.evt.touches[0].clientX;
      var touchposy = e.evt.touches[0].clientY;
      cursor_pos = [touchposx, touchposy];
      handleMove();
    } else if (e.evt.touches.length === 2) {
      var touch1 = e.evt.touches[0];
      var touch2 = e.evt.touches[1];
      var dist = Math.sqrt(Math.pow(touch1.clientX - touch2.clientX, 2) + Math.pow(touch1.clientY - touch2.clientY, 2))

      var newZoom = cameraZoomStart * (dist / touchesDist)

      var zoomCenterX = (touch1.clientX + touch2.clientX) / 2;
      var zoomCenterY = (touch1.clientY + touch2.clientY) / 2;
      var [ax, ay] = toGlobalSpace(zoomCenterX, zoomCenterY);

      camera.move((ax - zoomCenterX / newZoom), (ay - zoomCenterY / newZoom), newZoom);
    }
  }

  const handleMouseMove = (e) => {
    cursor_pos = [e.evt.clientX, e.evt.clientY];
    handleMove();
  }

  const handleMouseScroll = (e) => {
    if (e.evt.wheelDelta === 0)
      return;

    var newZoom;
    if (e.evt.wheelDelta > 0) {
      newZoom = camera.zoom * CAMERA_ZOOM_SPEED;
    } else {
      newZoom = camera.zoom / CAMERA_ZOOM_SPEED;
    }

    newZoom = Math.min(newZoom, MAX_ZOOM);
    // newZoom = Math.max(newZoom, MIN_ZOOM);

    var [ax, ay] = toGlobalSpace(cursor_pos[0], cursor_pos[1]);

    camera.move((ax - cursor_pos[0] / newZoom), (ay - cursor_pos[1] / newZoom), newZoom);
  }

  const handleTouchUp = (e) => {
    setCameraZoomStart(camera.zoom);
    handleUp();
  }

  const handleMouseUp = (e) => {
    if (oneClickControls) {
      handleUp();
      return;
    }

    if (e.evt.which === 1) {
      switchState(CHOOSE_TYPE);
    } else if (e.evt.which === 3) {
      switchState(IDLE);
    }
  }

  const cropImageToSelection = () => {
    let image = new window.Image();

    var [x, y] = toRelativeSpace(posX, posY);
    var [w, h] = [width * camera.zoom, height * camera.zoom];

    // the biggest side must be 512px
    var pixelRatio = 512 / Math.max(w, h);

    image.src = imageLayerRef.current.toDataURL({ pixelRatio: pixelRatio });

    let imageSaveInfo = {
      x: x * pixelRatio,
      y: y * pixelRatio,
      w: w * pixelRatio,
      h: h * pixelRatio,
      image: image
    }

    setImageSave(imageSaveInfo);
  }

  const handleClickRefresh = () => {
    setImageDivList([]);

    var url_get_image_with_params = URL_GET_IMAGES + '?posX=0&posY=0&width=100&height=100&room=' + room;


    fetch(url_get_image_with_params).then((data) => data.json())
      .then((json) => json.message)
      .then((images) => Array.from(images).forEach((image) => {
        addNewImage(URL_BUCKET + image.path, image.posX, image.posY, image.width, image.height, image.prompt);
      }));
  };

  // const handleStartVm = () => {
  //   fetch(URL_START_VM).then((data) => alert('VM SARTED'));
  // };

  // const handleStopVm = () => {
  //   fetch(URL_STOP_VM).then((data) => alert('VM STOPPED'));
  // };

  const handleStatusVm = () => {
    // fetch(URL_STATUS_VM).then(data => data.json()).
    //   then((data) => alert(data.message));
  };

  const handlePromptButtons = (type) => {
    generation_type = type;

    if (type !== "new_image")
      cropImageToSelection();

    if (type === "save") {
      setTimeout(function () { imageSaveRef.current.download(); }, 100);
      return;
    }

    switchState(PROMPT);
  }

  const handleSave = () => {
    cropImageToSelection();

    setTimeout(function () { imageSaveRef.current.download(); }, 100);
  }

  const handleSend = () => {
    var x = Math.floor(posX)
    var y = Math.floor(posY)
    var w = Math.floor(width)
    var h = Math.floor(height)

    var prompt = document.getElementById('prompt_input').value + ' ' + props.modifiers.positive
    console.log(prompt)
    document.getElementById('prompt_input').value = ''

    hideSelectionRect();
    user.getIdToken(true);
    var imageParamsDict = {
      'credential': user.accessToken,
      'prompt': btoa(prompt),
      'room': room,
      'posX': x,
      'posY': y,
      'width': w,
      'height': h,
      'negative_prompt': props.modifiers.negative
    }

    if (generation_type === "outpainting" || generation_type === "img_to_img") {
      var uri = imageSaveRef.current.uri()
      uri = uri.substring(22);
      imageParamsDict['init_image'] = uri;
    }

    var colabLinkProtocol=props.colabLink.split("://")[0];
    var colabLinkAdress=props.colabLink.split("://")[1];
    var url_function_imagen_with_action = URL_FUNCTION_IMAGEN + '?action=' + generation_type + '&colabLinkProtocol=' + colabLinkProtocol + '&colabLinkAdress=' + colabLinkAdress;
    if (process.env.REACT_APP_TOPIC_ID !== undefined){
        url_function_imagen_with_action += "&topic_id=" + process.env.REACT_APP_TOPIC_ID;
    }
    fetch(url_function_imagen_with_action, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(imageParamsDict),
    }).then(handleFetchErrors).then((response) =>  {
        console.log(response.status)
        var toast_text = "";
        if (response.status === 201){
            toast_text = "Prompt added to queue"
        }
        if (response.status === 202){
            toast_text = "Prompt added to queue, it's the first generation in a while, cold start take around 3 min"
        }

        if (toast_text !== ""){
            toast.info(toast_text, {
                position: "bottom-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    })

    addNewPlaceholder(x, y, w, h);
  };

  function handleFetchErrors(response) {
    if (!response.ok) {
      toast.error('Error ! Did you login and confirm your mail adresse ?', {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      console.log(response);
      throw Error(response.statusText);
    }
    return response;
  }

  return (
      <div style={{cursor: cursor}} className={"ImageCanvas"}
      >
        <div className="top_button_bar">


          {oneClickControls &&
              <>
                {/*<button onClick={() => switchMode(VIEW)}> View </button>*/}
                {/*<button onClick={() => switchMode(EDIT)}> Edit </button>*/}
              </>
          }


          {/*<button onClick={() => handleClickRefresh()}> Refresh</button>*/}
        </div>

        <Box className={"ButtonCoordModal"} style={{position: "absolute", bottom: 1, left: 1, zIndex: 99}}>
          <CoordsModal
              x={Math.round(camera.x)}
              y={Math.round(camera.y)}
              zoom={Math.round(camera.zoom * 100)}
              room={room}
          />
        </Box>


        <Box style={{position: "absolute", bottom: 1, right: 1}}>
          <HelpModalButton show={false}/>

          <Fab color="secondary" onClick={() => handleClickRefresh()} aria-label="refresh">
            <RefreshIcon/>
          </Fab>
        </Box>

        <Box className={"ModeSelectionButtons"}
             style={{position: 'absolute', bottom: 1, left: "50%", transform: "translateX(-50%)", zIndex: 99}}>
          <Fab aria-label="help" style={{margin: 5}} onClick={() => switchMode(VIEW)}>
            <PanToolIcon color={currentMode === VIEW ? "primary" : "disabled"}/>
          </Fab>
          <Fab aria-label="refresh" onClick={() => switchMode(EDIT)}>
            <HighlightAltIcon color={currentMode === EDIT ? "primary" : "disabled"}/>
          </Fab>
        </Box>
{/* 
      <MyDrawer
          camera={props.camera}
          modifiers={props.modifiers}
          setModifiers={props.setModifiers}
          history={props.history}
          canvasMeta={props.canvasMeta}

      /> */}

      <Stage

          ref={stageRef}

          className={"canvas"}

          width={canvasMeta.w}
          height={canvasMeta.h}

          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleMouseScroll}

          onTouchStart={handleTouchDown}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchUp}
      >

        <Layer ref={imageLayerRef}
        >
          <Rect
              width={canvasMeta.w}
              height={canvasMeta.h}
          />

          {
            imageDivList.map((img, i) => {
              var cameraBox = {
                x: camera.x - (window.innerWidth / camera.zoom) * 0.125,
                y: camera.y - (window.innerHeight / camera.zoom) * 0.125,
                w: (window.innerWidth / camera.zoom) * 1.25,
                h: (window.innerHeight / camera.zoom) * 1.25
              }
              if (
                overlap(cameraBox, img)
              ) {
                var [x, y] = toRelativeSpace(img.x, img.y);

                // display image only if the area is > 25px
                if (img.w * camera.zoom * img.h * camera.zoom > 25) {
                  return (
                    <URLImage
                        key={i}
                        src={img.src}
                        x={x}
                        y={y}
                        avg_color={"#FFFADA"}
                        width={img.w * camera.zoom}
                        height={img.h * camera.zoom}
                        prompt={img.prompt}
                        mode={currentMode}
                        pseudo={img.pseudo}
                        timestamp={img.timestamp}
                        onClickImage={onClickImage}
                    />)
                }
              }

            })
          }
        </Layer>

        <Layer>
          {
            Array.from(placeholderList.values()).map((pl, i) => {
              if (!pl) {
                return;
              }

              var [x, y] = toRelativeSpace(pl.x, pl.y);
              return (
                <LoadPlaceholder
                  key={i}
                  x={x}
                  y={y}
                  width={pl.w * camera.zoom}
                  height={pl.h * camera.zoom}
                />)
            })
          }

          {Math.abs(width * camera.zoom * height * camera.zoom) > 100 &&
              <PromptRect
                  x={(posX - camera.x) * camera.zoom}
                  y={(posY - camera.y) * camera.zoom}
                  width={width * camera.zoom}
                  height={height * camera.zoom}
                  handlePromptButtons={handlePromptButtons}
                  handleSend={handleSend}
                  handleSave={handleSave}
                  currentState={currentState}
                  currentMode={currentMode}
                  onHelpClick={() => {
                    setCurrentStep(7)
                    setIsOpen(true)
                  }}
              />
          }
        </Layer>

      </Stage>

      {
        imageSave !== null &&
        <ImageSaverLayer ref={imageSaveRef} imageSave={imageSave} />
      }


      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

    </div>
  );

}

export default MyCanvas;
