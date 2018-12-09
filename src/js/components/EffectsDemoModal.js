import React from "react";
import {connect} from "react-redux";

import {Scrollbars} from "react-custom-scrollbars";
import Input from "@material-ui/core/Input";
import FormLabel from "@material-ui/core/FormLabel";
import Typography from "@material-ui/core/Typography";
import Slider from "@material-ui/lab/Slider";

import * as tf from "@tensorflow/tfjs";
import * as layout from "../ar/layout-action";


@connect((store) => {
  return {
    modalHeight: store.layout.modalHeight,
    modalWidth: store.layout.modalWidth,
    medScreenSize: store.layout.medScreenSize,
    smallScreenSize: store.layout.smallScreenSize,
    largeImageCanvasSize: store.layout.largeImageCanvasSize,
    medImageCanvasSize: store.layout.medImageCanvasSize,
    smallImageCanvasSize: store.layout.smallImageCanvasSize
  };
})
class EffectsDemoModal extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      iterSliderValue: 0,
      fileChooserValue: ""
    };

    this.resizeCanvases = this.resizeCanvases.bind(this);

    this.inCanvasRef = React.createRef();
    this.outCanvasRef = React.createRef();

    this.model = null;
    this.images = null;
  }


  resizeCanvases() {
    let canvasSize;

    if (this.props.modalWidth > this.props.medScreenSize){
      canvasSize = this.props.largeImageCanvasSize;
    }
    else if (this.props.modalWidth > this.props.smallScreenSize){
      canvasSize = this.props.medImageCanvasSize;
    }
    else {
      canvasSize = this.props.smallImageCanvasSize;
    }

    let ctx = this.inCanvasRef.current.getContext("2d");
    if (ctx.canvas.width !== canvasSize || ctx.canvas.height !== canvasSize) {
      ctx.canvas.width = canvasSize;
      ctx.canvas.height = canvasSize;

      this.setState({...this.state, iterSliderValue: 0, fileChooserValue: ""});
    }
    
    ctx = this.outCanvasRef.current.getContext("2d");
    if (ctx.canvas.width !== canvasSize || ctx.canvas.height !== canvasSize) {
      ctx.canvas.width = canvasSize;
      ctx.canvas.height = canvasSize;
    }
  }


  componentDidMount() {
    this.props.dispatch(layout.setIsLoading(true));
    this.resizeCanvases();
    window.addEventListener("resize", this.resizeCanvases);

    tf.setBackend("webgl");

    tf.loadFrozenModel("src/models/pencil/tensorflowjs_model.pb",
                       "src/models/pencil/weights_manifest.json").then((model)=>{
                        this.model = model;
                        this.props.dispatch(layout.setIsLoading(false));
                       });
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.resizeCanvases);

    tf.disposeVariables();
  }


  render() {

    return (
      <div>
        
        <Scrollbars
          style={{height: this.props.modalHeight, minHeight: this.props.modalHeight,
                  width: this.props.modalWidth, minWidth: this.props.modalWidth}}
          autoHide
          autoHideTimeout={1000}
          autoHideDuration={200}>

          <div className="modal-inside">
            <h1>Convnet Effects Demo</h1>


            <p>Deep convolutional neural networks display some of the
            best performances in image recognition and classification
            tasks. When trained instead to predict pixel values,
            they can generate interesting iterative image effects,
            as demonstrated by this network trained on pencil drawings.</p>

            <div className="effects-image"></div>

            <p>The network architecture is similar to the one in the digit
            recognition demo but with 8 pyramidal bottleneck residual
            units and a widening factor of &alpha;=10, and no fully-connected
            layers. Weights were initialized
            the same way as in the digit recognition demo and the model was trained
            the same way, but with a sum of squares loss function. Training
            data consisted of 200&times;200 patches extracted from pencil-drawn
            images downloaded from the internet.</p>


            <FormLabel component="legend">Try It Out</FormLabel>
            <p>The model runs in the browser
            with <a href="http://js.tensorflow.org/">TensorFlowJS</a>.
            This demo is very computationally intensive. It requires modern
            hardware, a modern browser, and support for WebGL. It may not run
            on mobile devices. To see the model in action, choose an input
            image below and wait for the network to generate output. It may
            take a while.</p>

            <div className="row100">
              <div className="column2">
                <div className="centered">
                  <h3>Input Image</h3>
                  <canvas ref={this.inCanvasRef} className="image-canvas"/>

                  <div>

                    <Input type="file" className="input-file-chooser"
                      value={this.state.fileChooserValue}

                      onChange={(e)=>{

                        if (this.state.fileChooserValue != e.target.value) {
                          this.setState({...this.state, fileChooserValue: e.target.value});
                        }

                        let reader = new FileReader();
                        reader.onloadend = () => {

                          let ctx = this.inCanvasRef.current.getContext("2d");
                          let img = new Image();
                          img.onload = () => {

                            ctx.fillStyle = "white";
                            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

                            if (img.height <= ctx.canvas.height && img.width <= ctx.canvas.width) {
                              let x = ctx.canvas.width / 2 - img.width / 2;
                              let y = ctx.canvas.height / 2 - img.height / 2;
                              ctx.drawImage(img, x, y);
                            }
                            else {
                              // Scale the image to fit inside the canvas.
                              let x;
                              let y;
                              let width;
                              let height;
                              if (img.height > img.width) {
                                let scale = ctx.canvas.height / img.height;
                                height = ctx.canvas.height;
                                width = img.width * scale;
                                x = ctx.canvas.width / 2 - width / 2;
                                y = 0;
                              }
                              else {
                                let scale = ctx.canvas.width / img.width;
                                height = img.height * scale;
                                width = ctx.canvas.width;
                                x = 0;
                                y = ctx.canvas.height / 2 - height / 2;
                              }
                              ctx.drawImage(img, x, y, width, height);


                              let imgData = ctx.getImageData(0, 0, ctx.canvas.width,
                                                             ctx.canvas.height);
                              let buffer = tf.buffer([1, imgData.height, imgData.width, 1],
                                                     "float32");

                              for (let j=0; j < imgData.height; j++) {
                                for (let i=0; i < imgData.width; i++) {
                                  let k = 4 * (j * imgData.width + i);
                                  let avg_val = (imgData.data[k]
                                                 + imgData.data[k+1]
                                                 + imgData.data[k+2]) / 3.0;
                                  buffer.set(avg_val / 255.0, 0, j, i, 0);
                                }
                              }

                              let imgBatch = buffer.toTensor();
                            
                              if (this.model) {
                                let outBatch = imgBatch;
                                this.images = [];

                                for (let i=0; i < 4; i++) {
                                  outBatch= this.model.execute({patch: outBatch});

                                  let img = outBatch.reshape([outBatch.shape[1], outBatch.shape[2]]);
                                  tf.toPixels(img).then((pixels) => {
                                    let imgData = new ImageData(pixels, img.shape[1], img.shape[0]);
                                    this.images.push(imgData);
                                    if (i == 3) {
                                      this.props.dispatch(layout.setIsLoading(false));
                                      ctx = this.outCanvasRef.current.getContext("2d");
                                      ctx.putImageData(this.images[this.state.iterSliderValue], 0, 0);
                                    }
                                  });
                                }
                                

                                

                              }

                            }
                            

                            

                            
                          }
                          img.src = reader.result;
                        }

                        if (e.target.files[0]) {
                          this.props.dispatch(layout.setIsLoading(true));
                          reader.readAsDataURL(e.target.files[0]);
                        }
                        


                    }} />

                  </div>


                </div>
              </div>

              <div className="column2">
                <div className="centered">
                  <h3>Output Image</h3>
                  <canvas ref={this.outCanvasRef} className="image-canvas"/>
                  <div>
                    <Typography>Effect Iterations</Typography>
                    <Slider className="effects-slider"
                      value={this.state.iterSliderValue}
                      min={0}
                      max={3}
                      step={1}
                      onChange={(evt, value)=>{

                        if (this.images) {
                          let ctx = this.outCanvasRef.current.getContext("2d");
                          ctx.putImageData(this.images[value], 0, 0);
                        }
                        
                        this.setState({...this.state, iterSliderValue: value})
                      }}
                    />
                  </div>
                </div>
              </div>

            </div>


          </div>

        </Scrollbars>
      </div>);
  }



}



export default EffectsDemoModal;
