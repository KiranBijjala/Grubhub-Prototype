import React, { Component } from 'react'
import '../App.css';
import '../css/bootstrap.css';
import axios from 'axios';
// import {ROOT_URL} from "../config";
import ROOT_URL from './const'
class Reply extends Component {
    constructor(props){
        super(props);
        this.state = {
            writereply : "",
            refresh : "",
            status : "",

          };
          this.replymessage = this.replymessage.bind(this)
        }

        componentWillReceiveProps(nextprops){
                this.setState({
                    status : nextprops.status
                })
        }

        replymessage(value){
            console.log(value);
                        const data = {
                         id : this.props.data._id,
                         reply : this.state.writereply
                       }
            
                       console.log(data);
                       //set the with credentials to true
                       axios.defaults.withCredentials = true;
                       //make a post request with the user data
                       axios.post(`${ROOT_URL}/ReplyMessage`,data)
                           .then(response => {
                               console.log("Status Code  is : ",response.status);
                               console.log(response.data);
                               if(response.status === 200){
                                // this.props.update();
                                this.setState({
                                    refresh : true
                                })
                                       console.log('Replied successfully');
                               }else{
                                   console.log('Replied failed !!! ');
               
                               }
                    })
            console.log(this.state.writereply);        
     this.state.writereply == "" ? alert("Enter some text to reply") : alert("Replied. Refresh the page to see the changes")
                }
            

  render() {
    return (
      <div>
          <div style = {{marginLeft : "158px"}}>
                    <input style = {{width : "321px"} } value={this.state.writereply} onChange={(e)=>{ this.setState({writereply : e.target.value}) }} className="form-control" />
                    <br></br>
                    <button style = {{marginLeft : "221px"}} className= "btn btn-primary" onClick={this.replymessage}>Reply </button>
            </div>
      </div>
    )
  }
}
export default Reply;