import React from "react";
import {connect} from "react-redux";

import {Scrollbars} from "react-custom-scrollbars";
import FormLabel from "@material-ui/core/FormLabel";
import Button from "@material-ui/core/Button";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";


import * as tf from "@tensorflow/tfjs";
import * as layout from "../ar/layout-action";


class DrawableCanvas extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.isMouseDown = false;
    this.lastX = 0;
    this.lastY = 0;

    this.canvasRef = React.createRef();

    this.getContext = this.getContext.bind(this);

    this.clearCanvas = this.clearCanvas.bind(this);
    this.clickDown = this.clickDown.bind(this);
    this.clickUp = this.clickUp.bind(this);
    this.clickMove = this.clickMove.bind(this);
  }


  getContext(context) {
    return this.canvasRef.current.getContext(context);
  }


  componentDidMount() {

    let ctx = this.canvasRef.current.getContext("2d");
    ctx.canvas.width = 128;
    ctx.canvas.height = 128;

    this.canvasRef.current.addEventListener("mousedown", this.clickDown, false);
    this.canvasRef.current.addEventListener("mouseup", this.clickUp, false);
    this.canvasRef.current.addEventListener("mouseout", this.clickUp, false);
    this.canvasRef.current.addEventListener("mousemove", this.clickMove, false);

    this.canvasRef.current.addEventListener("touchstart", this.clickDown, false);
    this.canvasRef.current.addEventListener("touchend", this.clickUp, false);
    this.canvasRef.current.addEventListener("touchmove", this.clickMove, false);

    this.clearCanvas();
  }

  componentWillUnmount() {

    this.canvasRef.current.removeEventListener("mousedown", this.clickDown);
    this.canvasRef.current.removeEventListener("mouseup", this.clickUp);
    this.canvasRef.current.removeEventListener("mouseout", this.clickUp);
    this.canvasRef.current.removeEventListener("mousemove", this.clickMove);

    this.canvasRef.current.removeEventListener("touchstart", this.clickDown);
    this.canvasRef.current.removeEventListener("touchend", this.clickUp);
    this.canvasRef.current.removeEventListener("touchmove", this.clickMove);
  }


  clearCanvas() {
    let ctx = this.canvasRef.current.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }


  clickDown(e) {
    this.isMouseDown = true;
    let rect = this.canvasRef.current.getBoundingClientRect();

    if (e.changedTouches) {
      // Touch event.
      this.lastX = e.changedTouches[0].clientX - rect.x;
      this.lastY = e.changedTouches[0].clientY - rect.y;
    }
    else {
      // Mouse event.
      this.lastX = e.clientX - rect.x;
      this.lastY = e.clientY - rect.y;
    }
    
    e.preventDefault();
  }

  clickUp(e) {
    let changed = this.isMouseDown;
    this.isMouseDown = false;
    e.preventDefault();
    if (this.props.onDraw && changed) {
      this.props.onDraw();
    }
  }

  clickMove(e) {
    if (this.isMouseDown) {
      let ctx = this.canvasRef.current.getContext("2d");
      let rect = this.canvasRef.current.getBoundingClientRect();
      let mouseX;
      let mouseY;

      if (e.changedTouches) {
        // Touch event.
        mouseX = e.changedTouches[0].clientX - rect.x;
        mouseY = e.changedTouches[0].clientY - rect.y;
      }
      else {
        // Mouse event.
        mouseX = e.clientX - rect.x;
        mouseY = e.clientY - rect.y;
      }

      ctx.strokeStyle = "#000";
      ctx.lineJoin = "round";
      ctx.lineWidth = 16;

      ctx.beginPath();
      ctx.moveTo(this.lastX, this.lastY);
      ctx.lineTo(mouseX, mouseY);
      ctx.closePath();
      ctx.stroke();

      this.lastX = mouseX;
      this.lastY = mouseY;
      e.preventDefault();
    }
  }


  render() {

    return (
      <div>
        <canvas className="digit-canvas" ref={this.canvasRef} />
      </div>);
  }



}






@connect((store) => {
  return {
    modalHeight: store.layout.modalHeight,
    modalWidth: store.layout.modalWidth
  };
})
class DigitsDemoModal extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      numberText: ""
    }

    this.predict = this.predict.bind(this);
    this.onCanvasDraw = this.onCanvasDraw.bind(this);

    this.canvasRef = React.createRef();
    this.model = null;
    this.readyToPredict = false;
    this.predictTimer = null;
  }



  componentDidMount() {
    this.props.dispatch(layout.setIsLoading(true));


    tf.setBackend("cpu");

    tf.loadFrozenModel("src/models/digits/tensorflowjs_model.pb",
                       "src/models/digits/weights_manifest.json").then((model)=>{
                        this.model = model;
                        this.props.dispatch(layout.setIsLoading(false));
                       });

    this.predictTimer = window.setInterval(()=>{
      if (this.readyToPredict) {
        this.readyToPredict = false;
        let digit = this.predict();
        let numbers = ["Zero", "One", "Two", "Three", "Four", "Five",
                       "Six", "Seven", "Eight", "Nine"];
        this.setState({...this.state, numberText: numbers[digit]});
        this.props.dispatch(layout.setIsLoading(false));
      }
    }, 100);
  }

  componentWillUnmount() {
    tf.disposeVariables();

    if (this.predictTimer) {
      window.clearInterval(this.predictTimer);
    }
  }



  predict() {

    let ctx = this.canvasRef.current.getContext("2d");

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
      let dist = this.model.execute({img: imgBatch}).flatten();
      let digit = tf.argMax(dist).buffer().get(0);

      return digit;
    }

    return 0;
  }




  onCanvasDraw() {

    this.props.dispatch(layout.setIsLoading(true));
    this.readyToPredict = true;

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
            <h1>Digit Recognition Demo</h1>

            <p>One of the most well-known datasets used for evaluating image
            classification tasks is the MNIST Handwritten Digits Database<sup>[1]</sup>.
            It is very easy to classify: High-performing classifiers can achieve
            accuracies of nearly 100%. It is commonly used as a sort
            of "Hello, World!" or sanity check for new classifier models.</p>

            <div className="digits-image"></div>

            <p>Here, the MNIST database was used to train a deep neural network
            to recognize digits drawn into an HTML5 canvas element. The
            network is a deep pyramidal bottleneck residual convolutional neural
            network<sup>[2]</sup> with batch normalization<sup>[3]</sup> and
            parametric ReLU activations<sup>[4]</sup>. There are 18 pyramidal
            bottleneck residual units with a widening factor of &alpha;=30,
            followed by two fully connected layers each with a dropout of 30%.
            Weights were initialized using layer-sequential unit-variance
            initialization<sup>[5]</sup> after
            pre-initializing with orthonormal matrices<sup>[6]</sup>, while
            ReLU parameters were all initialized to 0.3 and all biases to 0.
            Training data consisted of MNIST digit images binarized to black and
            white and deformed by scaling, rotation, and translation. The
            model was trained on the GPU as a TensorFlow Estimator
            with stochastic gradient descent and Nesterov momentum, using a
            negative log likelihood objective function, L2 weight regularization, and
            gradient clipping to a norm of 3.</p>

            <div className="references-panel">
              <ExpansionPanel elevation={0}>
                <ExpansionPanelSummary expandIcon={<span>&#9013;</span>}>
                  <span className="references-header">References</span>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    
                  <ol className="references-list">
                    <li>LeCun, Yann, et al.
                    "<a href="https://ieeexplore.ieee.org/abstract/document/726791">Gradient-based
                    learning applied to document recognition</a>." 1998.</li>

                    <li>Han, Dongyoon, Jiwhan Kim, and Junmo Kim.
                    "<a href="https://arxiv.org/abs/1610.02915">Deep pyramidal residual networks</a>." 2017.</li>

                    <li>Ioffe, Sergey, and Christian Szegedy.
                    "<a href="https://arxiv.org/abs/1502.03167">Batch normalization:
                    Accelerating deep network training by reducing internal covariate shift</a>." 2015.</li>

                    <li>He, Kaiming, et al. "<a href="https://arxiv.org/abs/1502.01852">Delving deep into rectifiers:
                    Surpassing human-level performance on imagenet classification</a>." 2015.</li>

                    <li>Mishkin, Dmytro, and Jiri Matas. "<a href="https://arxiv.org/abs/1511.06422">All you
                    need is a good init</a>." 2015.</li>

                    <li>Saxe, Andrew M., James L. McClelland, and Surya Ganguli.
                    "<a href="https://arxiv.org/abs/1312.6120">Exact solutions to the nonlinear dynamics of
                    learning in deep linear neural networks</a>." 2013.</li>

                  </ol>
                </ExpansionPanelDetails>
              </ExpansionPanel>

            </div>


            <FormLabel component="legend">Try It Out</FormLabel>
            <p>The model runs in the browser
            with <a href="http://js.tensorflow.org/">TensorFlowJS</a>.
            This demo is computationally intensive. It requires modern
            hardware and a modern browser. To see the
            model in action, draw a single digit in the box below and wait for
            the classifier to run. If the digit is guessed wrong, try drawing
            it a little differently or at a different location on the canvas.</p>

            <div className="row100">
              <div className="column2">
                <div className="centered">
                  <h3>Drawing</h3>
                  <DrawableCanvas onDraw={this.onCanvasDraw} ref={this.canvasRef} />
                  <Button variant="contained" color="primary"
                   onClick={()=>{
                    this.canvasRef.current.clearCanvas();
                    this.setState({...this.state, numberText: ""}); 
                  }}>
                    Erase
                  </Button>
                </div>
              </div>

              <div className="column2">
                <div className="centered">
                  <h3>Classification</h3>
                  <p>{this.state.numberText}</p>
                </div>
              </div>

            </div>

            


          </div>

        </Scrollbars>
      </div>);
  }



}



export default DigitsDemoModal;



