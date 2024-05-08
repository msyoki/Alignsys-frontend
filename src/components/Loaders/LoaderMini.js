import React from "react";
import loading from "../../images/loading.svg";

const LoadingMini = (props) => (
    <div className='App'>
        <div className='text-center p-3'>
          <div className="spinner ">
        
            <img src={loading} alt="Loading" width='100px' margin='50%'/>
            <p className="m-2 text-dark" style={{fontSize:'12px'}}>{props.msg?<>{props.msg}</>:<>Please wait, processing request ...</>}</p>
          </div>
        </div>
    </div>
  
);

export default LoadingMini;