// () -> handle poll moderation
async function moderatePoll(request, response, next) {

    // try safely*
    try {

        // grab the poll-title and description!
        const {title, description, options, tags} = request.body;
        console.log(title, description, options, tags);
        // combine incoming poll data
        const allTexts = [
            title || "",
            description || "",
            ...(Array.isArray(options) 
                ? options.map(opt => (opt.text || ""))
                : []),
            ...(Array.isArray(tags) 
                ? tags.map(tag => (tag || ""))    
                : [])
        ].map(t => String(t).toLowerCase());  

        // check log**
        // console.log(allTexts);

       // merge each array into single string
        const combinedText = allTexts.join(" | ");

        // check log**
        console.log(combinedText);
        
        // set the prompt for ai..,
        const prompt = `Classify this poll content (title + description + options + tags) into SAFE or UNSAFE (hate / violence / self-harm / suicide / illegal / slaughter / vulgar): "${combinedText}"`;


        try {
            // interact with phi3:mini (AI-model)
            const apiRequest = await fetch("http://127.0.0.1:11434/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                model: "phi3:mini",
                prompt: prompt,
                stream: false
                }),
          });

          // when response is not successful
          if (!apiRequest.ok) {
            throw new Error(`HTTP error! Status: ${apiRequest.status}`);
          }

          // handle incoming response
          const data = await apiRequest.json();
          const outcome = (data.response || "Unknown").trim().toUpperCase();
          
          // check outcome
          if(outcome.includes("UNSAFE")) {

            // send error to client
            response.status(400).json({
                "message": "UNSAFE",
                "status": false,
            });
          } else {

            // log**
            console.log("poll data was safe!");

            // send success response to client
            response.status(200).json({
                "message": "SAFE",
                "status": true,
            });
          }

        } catch (error) {
          console.error("Fetch error:", error);
        }
    }

    // handle errors
    catch(error) {
        // send error to client
        console.error("Moderation error:", error.message);
        response.status(500).json({ error: "Internal moderation error." });
    }
} 

module.exports = moderatePoll;