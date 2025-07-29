// grab module(s)
import { useState } from "react";

// () -> CreatePoll component
function CreatePoll() {
    // initial state array
    const [inputType, setInputType] = useState("text");
    
    // intitial pollOptions state array
    // minimum 2 options**
    const [pollOptions, setPollOptions] = useState(["", ""]);  

    // initial state array
    const [hoveredOptionIndex, setHoveredOptionIndex] = useState(null);
    
    // check log**
    // console.log(useState(["", ""]));

    // () -> handle option index change
    function handleOptionChange(value, index) {
        // check log**
        console.log(value);
        console.log(index);

        // get the options as copy
        let optionsCopy = pollOptions.slice(0);

        // update the value
        optionsCopy[index] = value;

        // update the state
        setPollOptions(optionsCopy);
        
    }

    // () -> add new option(s)
    function handleAddOption(event) {

        // restrict the reload!
        event.preventDefault();

        // when polls reached maximum limit? 6!
        if(pollOptions.length >= 5) {
            return "";
        }

        // a new copy of poll-options
        let newArray = pollOptions.slice(0);

        // add a new option!
        newArray.push("");

        // update the options with new-one
        setPollOptions(newArray);
    }

    // () -> handle option delete 
    function handleRemoveOption(index) {

        // check log**
        // console.log(index);

        // a copy of array except the item at index?
        let pollOptionsCopy = pollOptions.filter(function(option, i, pollOptions) {
            return i !== index;
        });

        // update the state/ poll-options
        setPollOptions(pollOptionsCopy);
    }

    // () -> handle input type's change when focused
    function handleInputFocusTextChange(event) {
        // check log**
        // console.log(event.target.type);

        // update the state (type of the focused input?)
        setInputType("date"); 
    }

 
    
    // return jsx!
    return(
        <main className="app-content">

            <form className="create-poll-form">
                <h1>Get started</h1>

                <input type="text" placeholder="What's title ?" />

                <div className="poll-description">
                    <label htmlFor="poll-description-text-area">Description</label>
                    <textarea className="poll-description-text-area">
                    </textarea>
                </div>

                <div className="poll-option-box">
                    {/* intially render 2 options minimum */}
                    {pollOptions.map(function(option, index, pollOptions) {
                        return (
                            <div
                                className="poll-option-wrap"
                                key={index}
                                onMouseEnter={(event) => setHoveredOptionIndex(index)}
                                onMouseLeave={(event) => setHoveredOptionIndex(null)}
                            >
                                <input 
                                    className="option"
                                    type="text"
                                    placeholder={"Option " + (index + 1)}
                                    onChange={(event) => handleOptionChange(event.target.value, index)}
                                />
                                {/* only show remove poll button when there are atleast 2 options! */}
                                {pollOptions.length > 2 && hoveredOptionIndex === index && (
                                    <span
                                        onClick={() => handleRemoveOption(index)}
                                    >
                                        <i className="ri-close-circle-line"></i>
                                    </span>
                                )}
                            </div>
                        )
                    })}
                </div>
           
                <div className="new-poll-option">   
                    {/* remove `add-option-button` when maximum limit reached! */}
                    {pollOptions.length !== 5 && (
                        <button 
                            className="new-poll-option-button"
                            onClick={handleAddOption}
                        >
                            <i className="ri-add-circle-line"></i>
                            Add option
                        </button>
                    )}
                </div>
                <div className="new-poll-option responsive">
                    <button className="responsive-btn">
                        <i className="ri-add-circle-line"></i>
                    </button>
                </div>
  
                <select className="poll-category">
                    <option value="Select Type?" hidden>Select Category?</option>
                    <option value="Technology">Technology</option>
                    <option value="Sports">Sports</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Politics">Politics</option>
                </select>
        
                <select className="poll-type">
                    <option value="Select Type?" hidden>Select Type?</option>
                    <option value="Single Choice">Single Choice</option>
                    <option value="Multi Choice">Multi Choice</option>
                </select>

                <input 
                    type={inputType} placeholder="Expiry Date ? "
                    onFocus={handleInputFocusTextChange}
                />

                <input 
                    type="text" placeholder="Some tags (ex: tech, technology etc...)"
                />
                <button type="submit">Create!</button>
            </form>
        </main>
    );
}

// expose to project!
export {CreatePoll};