// grab module(s)
import {Link} from "react-router-dom";

// () -> Home component
function Home() {


    // return jsx!
    return(
        <main className="home-content">
            <div className="text-container">
                <div className="main-text">
                    <h1>Let's Create a Poll</h1>
                    <span>and get the opinions you need</span>
                    <p>Make better decisions, get instant feedback, and predict voter behavior with the help of Poll.</p>
                    <button className="create-poll-btn">
                        <Link to={"/create-poll"}>
                            Create a poll
                        </Link>
                    </button>
                    <button>
                        <Link to={"/polls"}>
                            View Polls
                        </Link>
                    </button>
                </div>
            </div>
	</main>
    );
}

// expose to project!
export {Home};

/*
<section class="wrapper">
		<div class="text-container">
			<div class="main-text">
				<h1>Let's Create a Poll</h1>
				<span>and get the answer you need</span>
				<p>Make better decisions, get instant feedback, and predict voter behavior with the help of Poll.</p>
				<a href = "{% url 'create' %}">Create a Poll</a>
				<a href = "{% url 'viewpoll'  %}" class = "btn">View Polls</a>
			</div>
		</div>

		<div class="image-container">
			<img src="{% static 'img.png' %}"></img>
		</div>
	</section>
*/