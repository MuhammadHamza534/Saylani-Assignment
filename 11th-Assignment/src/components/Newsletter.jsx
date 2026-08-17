import { useState } from "react";

function Newsletter() {
  const [subscribed, setSubscribed] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setSubscribed(true);
  }

  return (
    <section className="newsletter shell" id="newsletter">
      <h2>
        STAY UP TO DATE ABOUT
        <br />
        OUR LATEST OFFERS
      </h2>

      {subscribed ? (
        <p className="thanks">
          Thanks! You are on the list.
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label>
            <span>✉</span>

            <input
              type="email"
              required
              placeholder="Enter your email address"
            />
          </label>

          <button type="submit">
            Subscribe to Newsletter
          </button>
        </form>
      )}
    </section>
  );
}

export default Newsletter;