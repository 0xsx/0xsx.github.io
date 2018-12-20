import React from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import CircularProgress from "@material-ui/core/CircularProgress";

import * as layout from "../ar/layout-action";
import * as nav from "../ar/nav-action";


import {AnchoredScroll, Anchor} from "./AnchoredScroll"
import EffectsDemoModal from "./EffectsDemoModal"
import DigitsDemoModal from "./DigitsDemoModal"




@connect((store) => {
  return {
    selectedAnchor: store.nav.selectedAnchor
  };
})
class NavMenu extends React.Component {

  render() {
    return (
      <ul className="float-list">
        <li><button className={"nav-button" + (this.props.selectedAnchor === "about" ? " selected" : "")}
        onClick={()=>{
          this.props.dispatch(layout.setInitScrollOffset(null));
          this.props.dispatch(nav.navTo(["about"]));
        }}>Who I Am</button></li>

        <li><button className={"nav-button" + (this.props.selectedAnchor === "projects" ? " selected" : "")}
        onClick={()=>{
          this.props.dispatch(layout.setInitScrollOffset(null));
          this.props.dispatch(nav.navTo(["projects"]));
        }}>What I Do</button></li>

        <li><button className={"nav-button" + (this.props.selectedAnchor === "hobbies" ? " selected" : "")}
        onClick={()=>{
          this.props.dispatch(layout.setInitScrollOffset(null));
          this.props.dispatch(nav.navTo(["hobbies"]));
        }}>What Else I Do</button></li>

        <li><button className={"nav-button" + (this.props.selectedAnchor === "contact" ? " selected" : "")}
        onClick={()=>{
          this.props.dispatch(layout.setInitScrollOffset(null));
          this.props.dispatch(nav.navTo(["contact"]));
        }}>Contact Me</button></li>
      </ul>
    );
  }
}

NavMenu.propTypes = {
  selectedAnchor: PropTypes.string
};

NavMenu.defaultProps = {
  selectedAnchor: ""
};






@connect((store) => {
  return {
    currentModalWindow: store.layout.currentModalWindow,
    pageHeight: store.layout.pageHeight,
    modalHeight: store.layout.modalHeight,
    modalWidth: store.layout.modalWidth,
    isLoading: store.layout.isLoading,
    modalPadding: store.layout.modalPadding,
    pathParts: store.nav.pathParts
  };
})
class AppMain extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.updateModalDimensions = this.updateModalDimensions.bind(this);
    this.scrollRef = React.createRef();
    this.modalRef = React.createRef();
    this.dimsTimer = null;
  }



  updateModalDimensions() {
    let modal = this.modalRef.current;

    if (modal) {
      let newHeight = modal.clientHeight - this.props.modalPadding;
      let newWidth = modal.clientWidth - this.props.modalPadding;

      if (newHeight !== this.props.modalHeight) {
        this.props.dispatch(layout.setModalHeight(newHeight));
      }
      if (newWidth !== this.props.modalWidth) {
        this.props.dispatch(layout.setModalWidth(newWidth));
      }
    }
  }


  componentDidMount() {
    this.dimsTimer = window.setInterval(this.updateModalDimensions, 100);
    this.props.dispatch(layout.setIsLoading(false));
  }

  componentWillUnmount() {
    if (this.dimsTimer) {
      window.clearInterval(this.dimsTimer);
    }
  }



  render() {

    let modalContentElement;
    switch (this.props.currentModalWindow) {

      case "EFFECTS_DEMO": {
        modalContentElement = <EffectsDemoModal />;
        break;
      }

      case "DIGITS_DEMO": {
        modalContentElement = <DigitsDemoModal />;
        break;
      }


      default: {
        modalContentElement = null;
      }
    }


    return (
      <div>

        <div className={"loading " + (this.props.isLoading ? "disp-show" : "disp-hide")}>
          <div className="loading-inside">
            <CircularProgress className="loading-progress" /><h1>Loading...</h1>
            
          </div>
        </div>

        <div className={"modal " + (modalContentElement ? "modal-show" : "modal-hide")}>
          <div className={"modal-box " + (modalContentElement ? "modal-show" : "modal-hide")}>
            <button className="modal-close-button"
                    onClick={()=>{
                      this.props.dispatch(layout.setCurrentModalWindow(null));
                    }}>&times;</button>
            
            <div className="modal-content" ref={this.modalRef}>
              {modalContentElement}
            </div>


          </div>
        </div>



        <AnchoredScroll ref={this.scrollRef}>

          <Anchor name="" minHeight={.8 * this.props.pageHeight}>

            <div className="header">
              <button className="float-left home-button"
                   onClick={()=>{this.props.dispatch(nav.navTo([]));}}><h1>[m]</h1>
              </button>
              <NavMenu />
            </div>

            <div className="hero-image">
              <div className="hero-text">
                <div className="avatar"><a href="https://github.com/0xsx"></a></div>
                <h1>0xsx [m]</h1>
                <ul className="float-list">
                  <li>Programming</li>
                  <li>&#10070;</li>
                  <li>Machine Learning</li>
                  <li>&#10070;</li>
                  <li>Signal Processing</li>
                </ul>
                
                <NavMenu />

              </div>
            </div>

          </Anchor>


          <Anchor name="about" minHeight={.8 * this.props.pageHeight}>
          <h1>About Me</h1>

          <div className="row100">
            <div className="column3">
              <h2>Experienced</h2>
              <p>I have a well-rounded academic history and a background in
              software development, and I utilize experience that ranges
              from professional coding and debugging to
              conducting and publishing experiments. Check out <a href="javascript:void(0)"
              onClick={()=>{this.props.dispatch(nav.navTo(["projects"]))}}>my
              projects</a> to see how I work.</p>
            </div>

            <div className="column3">
              <h2>Passionate</h2>
              <p>As a lifelong nerd I've always loved programming and problem solving. When
              I'm not writing code or running experiments for work, I like to be
              writing code and running experiments for fun. See <a href="javascript:void(0)"
              onClick={()=>{this.props.dispatch(nav.navTo(["hobbies"]))}}>my hobbies</a> for
              some examples.</p>
            </div>
            
            <div className="column3">
              <h2>Adaptive</h2>
              <p>Software projects are complex, and although there are
              best-practice ways to reduce hurdles, uncertainties inevitably appear.
              I'm resilient and robust in the face of unknowns
              and I deliver results through planning and
              research. <a href="javascript:void(0)"
              onClick={()=>{this.props.dispatch(nav.navTo(["contact"]))}}>Contact me</a> to
              talk about what we can work on together.</p>
            </div>
          </div>



          <div className="job-search">I'm looking for a job!</div>


          </Anchor>


          <hr />


          <Anchor name="projects" minHeight={.8 * this.props.pageHeight}>

          <h1>Work</h1>

          <h2>Neural Networks</h2>
          <div className="section-img"><img src="src/img/nnet.jpg" /></div>
          <p>Deep learning is one of the most exciting developments of computer
          science. Today's advanced software libraries and hardware 
          are changing the way we interact with machines. Artificial
          intelligence is pervasive and more powerful than ever, and its
          applications are growing.</p>
          <p>I study neural networks and deep learning, and I develop
          an <a href="https://0xsx.github.io/nnmaker/">open source software package</a> for
          creating, training, and deploying
          neural networks using TensorFlow. The following demos show some
          models I've created. They make take some time to load as they are
          deep models with many weights.</p>

          <button className="demo-button" onClick={()=>{
            let scroll = this.scrollRef.current.getWrappedInstance();
            let scrollOffset = scroll.getScrollTop();
            this.props.dispatch(layout.setInitScrollOffset(scrollOffset));
            this.props.dispatch(layout.setCurrentModalWindow("DIGITS_DEMO"));
          }}>See the digit recognition demo</button>

          <button className="demo-button" onClick={()=>{
            let scroll = this.scrollRef.current.getWrappedInstance();
            let scrollOffset = scroll.getScrollTop();
            this.props.dispatch(layout.setInitScrollOffset(scrollOffset));
            this.props.dispatch(layout.setCurrentModalWindow("EFFECTS_DEMO"));
          }}>See the convnet effects demo</button>

          


          <h2>Audio Processing</h2>
          <div className="section-img"><img src="src/img/audio.jpg" /></div>
          <p>Waveforms are fascinating objects. They can carry massive amounts of
          information and can be analyzed and modeled in many different ways. From
          music production to investigative acoustic analysis to real-time DSP, I love working
          with waveforms in all different settings. I have a research background in
          speech and signal processing and I create custom audio processing tools.
          I am author of an open source project called <a href="https://github.com/0xsx/FLACJACKet">FLACJACKet</a>,
          a DLNA server that encodes JACK audio streams in the FLAC format and
          transmits in near-real time.</p>


          <h2>Tool Development</h2>
          <div className="section-img"><img src="src/img/tool.jpg" /></div>
          <p>A good programmer is adaptive enough to solve problems across multiple
          domains. In addition to neural networks and signal processing, I'm experienced
          writing tools that get the job done for all kinds of different tasks. I like to
          develop tools that are user-friendly and easy to maintain. One open source
          project I maintain is <a href="https://github.com/0xsx/cbak">cbak</a>, a program for consolidating Google drive
          storage space and managing encrypted, versioned, compressed backups to the cloud.
          I use it to back up my own projects and data.</p>



          


          </Anchor>

          <hr />


          <Anchor name="hobbies" minHeight={.8 * this.props.pageHeight}>
          <h1>Play</h1>

          <h2>Crypto Trading</h2>
          <div className="section-img"><img src="src/img/trade.jpg" /></div>
          <p>Bitcoin and other cryptocurrencies have revolutionized digital
          economies. While the true monetary value of cryptocurrencies is debated,
          blockchain technology has become one of the most promising advancements
          of the last decade. I follow crypto news and I trade cryptocurrencies
          for fun. I'm particularly interested in algorithmic trading and in
          finding profitable ways to apply machine learning to
          real-time market analysis. I author <a href="https://github.com/0xsx/binance-tools">some tools</a> for
          data collection and experimentation with the Binance API.</p>

          <h2>Music Production</h2>
          <div className="section-img"><img src="src/img/music.jpg" /></div>
          <p>I'm not an artist but for fun I make music. I write tools for
          MIDI generation, instrument tuning, wavetable creation, and general
          audio processing. Algorithmic music production is one of my greatest
          research interests. I also enjoy experimenting with surround sound
          mixing.</p>

          <p>Here's something I made. For the intended
          listening experience it should be downloaded and played back through
          a 7.1 channel speaker system.</p>

          <div className="sc-embed"><iframe width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/547341069&color=%23555554&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=true"></iframe>
          </div>

          </Anchor>

          <hr />

          <Anchor name="contact" minHeight={.8 * this.props.pageHeight}>

          <h1>Contact Me</h1>

          <p>If you would like to contact me for any reason or just learn
          more about me, the following resources can help:</p>

          <ul className="contact-list">
          <li>Email: there.while.loop at gmail</li>
          <li><a href="https://github.com/0xsx">GitHub</a></li>
          <li><a href="https://stackoverflow.com/users/10076057/0xsx?tab=profile">Stack Overflow</a></li>
          </ul>


          </Anchor>


        </AnchoredScroll>


      </div>
    );
  }


}

export default AppMain;



