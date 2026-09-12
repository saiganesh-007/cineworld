import { useEffect, useState } from "react";

function Reviews({ id, type }) {
  const storageKey = `reviews_${type}_${id}`;

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  // ==========================================
  // LOAD REVIEWS
  // ==========================================

  useEffect(() => {
    const savedReviews = localStorage.getItem(storageKey);

    if (savedReviews) {
      try {
        setReviews(JSON.parse(savedReviews));
      } catch {
        setReviews([]);
      }
    } else {
      setReviews([]);
    }
  }, [storageKey]);

  // ==========================================
  // SAVE REVIEWS
  // ==========================================

  function saveReviews(updatedReviews) {
    setReviews(updatedReviews);

    localStorage.setItem(
      storageKey,
      JSON.stringify(updatedReviews)
    );
  }

  // ==========================================
  // SUBMIT REVIEW
  // ==========================================

  function handleSubmit(event) {
    event.preventDefault();

    if (rating === 0) {
      alert("Please select a rating.");
      return;
    }

    if (!comment.trim()) {
      alert("Please write a review.");
      return;
    }

    const newReview = {
      id: Date.now(),
      rating: rating,
      comment: comment.trim(),
      date: new Date().toLocaleDateString(),
    };

    saveReviews([newReview, ...reviews]);

    setRating(0);
    setHoverRating(0);
    setComment("");
  }

  // ==========================================
  // DELETE REVIEW
  // ==========================================

  function handleDelete(reviewId) {
    const updatedReviews = reviews.filter(
      (review) => review.id !== reviewId
    );

    saveReviews(updatedReviews);
  }

  // ==========================================
  // AVERAGE RATING
  // ==========================================

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce(
            (total, review) => total + review.rating,
            0
          ) / reviews.length
        ).toFixed(1)
      : "0.0";

  const roundedAverage =
    Math.round(Number(averageRating));

  return (
    <section className="mt-16 border-t border-white/10 pt-10 pb-16">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Ratings & Reviews
        </h2>

        <p className="text-gray-500 mt-2 text-sm">
          Share your opinion about this{" "}
          {type === "movie" ? "movie" : "title"}.
        </p>
      </div>


      {/* =====================================
          WRITE REVIEW
      ===================================== */}

      <div className="
        bg-zinc-950
        border
        border-white/10
        rounded-2xl
        p-6
        md:p-7
        mb-8
      ">

        <h3 className="
          text-lg
          font-semibold
          text-white
          mb-5
        ">
          How would you rate this?
        </h3>


        {/* STAR RATING */}

        <div className="flex items-center gap-1 mb-6">

          {[1, 2, 3, 4, 5].map((star) => {

            const active =
              star <= (hoverRating || rating);

            return (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() =>
                  setHoverRating(star)
                }
                onMouseLeave={() =>
                  setHoverRating(0)
                }
                className={`
                  text-3xl
                  leading-none
                  transition-all
                  duration-150
                  hover:scale-110
                  ${
                    active
                      ? "text-yellow-400"
                      : "text-gray-700"
                  }
                `}
                aria-label={`${star} star`}
              >
                {active ? "★" : "☆"}
              </button>
            );
          })}

          {rating > 0 && (
            <span className="
              ml-3
              text-gray-400
              text-sm
            ">
              {rating}/5
            </span>
          )}

        </div>


        {/* COMMENT */}

        <textarea
          value={comment}
          onChange={(event) =>
            setComment(event.target.value)
          }
          placeholder="Write your review..."
          rows={4}
          maxLength={500}
          className="
            w-full
            bg-black
            border
            border-white/10
            rounded-xl
            p-4
            text-white
            placeholder-gray-600
            outline-none
            resize-none
            focus:border-red-500
            transition
          "
        />


        {/* CHARACTER COUNT */}

        <div className="
          flex
          justify-end
          mt-2
          text-xs
          text-gray-600
        ">
          {comment.length}/500
        </div>


        {/* SUBMIT */}

        <button
          type="button"
          onClick={handleSubmit}
          className="
            mt-4
            bg-red-600
            hover:bg-red-700
            active:scale-[0.98]
            px-6
            py-3
            rounded-lg
            text-white
            font-semibold
            transition
          "
        >
          Post Review
        </button>

      </div>


      {/* =====================================
          RATING SUMMARY
      ===================================== */}

      {reviews.length > 0 && (
        <div className="
          bg-zinc-950
          border
          border-white/10
          rounded-2xl
          p-6
          mb-8
        ">

          <div className="
            flex
            items-center
            gap-5
          ">

            <div className="
              text-4xl
              md:text-5xl
              font-bold
              text-white
            ">
              {averageRating}
            </div>

            <div>

              <div className="
                text-yellow-400
                text-xl
                tracking-wide
              ">
                {"★".repeat(roundedAverage)}
                {"☆".repeat(5 - roundedAverage)}
              </div>

              <p className="
                text-gray-500
                text-sm
                mt-1
              ">
                Based on {reviews.length}{" "}
                {reviews.length === 1
                  ? "review"
                  : "reviews"}
              </p>

            </div>

          </div>

        </div>
      )}


      {/* =====================================
          USER REVIEWS
      ===================================== */}

      <div>

        <h3 className="
          text-xl
          font-semibold
          text-white
          mb-5
        ">
          User Reviews
        </h3>


        {/* NO REVIEWS */}

        {reviews.length === 0 ? (

          <div className="
            bg-zinc-950
            border
            border-white/10
            rounded-2xl
            p-8
            text-center
          ">

            <div className="
              text-3xl
              mb-3
              opacity-50
            ">
              ★
            </div>

            <p className="text-gray-400">
              No reviews yet.
            </p>

            <p className="
              text-gray-600
              text-sm
              mt-2
            ">
              Be the first to review this title.
            </p>

          </div>

        ) : (

          <div className="space-y-4">

            {reviews.map((review) => (

              <article
                key={review.id}
                className="
                  bg-zinc-950
                  border
                  border-white/10
                  rounded-2xl
                  p-6
                  transition
                  hover:border-white/20
                "
              >

                {/* REVIEW HEADER */}

                <div className="
                  flex
                  items-start
                  justify-between
                  gap-4
                  mb-4
                ">

                  <div>

                    <div className="
                      text-yellow-400
                      text-lg
                      tracking-wide
                    ">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </div>

                    <p className="
                      text-gray-600
                      text-xs
                      mt-1
                    ">
                      {review.date}
                    </p>

                  </div>


                  {/* DELETE */}

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(review.id)
                    }
                    className="
                      text-gray-600
                      hover:text-red-500
                      text-sm
                      transition
                    "
                  >
                    Delete
                  </button>

                </div>


                {/* REVIEW TEXT */}

                <p className="
                  text-gray-300
                  leading-7
                  break-words
                ">
                  {review.comment}
                </p>

              </article>

            ))}

          </div>

        )}

      </div>

    </section>
  );
}

export default Reviews;