import React from "react";
import ReactDom from "react-dom";

const mainElement = document.createElement("div");
document.body.appendChild(mainElement);

const App = () => {
    return (
        <React.Fragment>
            <h1>Hello World</h1>
        </React.Fragment>
    );
};

ReactDom.render(<App />, mainElement);
