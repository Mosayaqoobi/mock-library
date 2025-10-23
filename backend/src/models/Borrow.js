import mongoose from "mongoose";

const borrowSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Book"
    },
    borrowedAt: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Date.now,
        type: Date
    },
    dueDate: {
        type: Date,
        required: true
    },
    returnedAt: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ["Active", "Returned", "overdue"],
        default: "active"
    },
    renew: {
        type: Number,
        default: 0,
        max: 3
    },
},
    {timestamps: true}
);
//index for faster queries
borrowSchema.index({userId: 1, status: 1});
borrowSchema.index({bookId: 1, status: 1});

//use virtual to check if overdue (overdue is a property)
borrowSchema.virtual("isOverdue").get(function() {
    return this.status === "active" && new Date() > this.dueDate;
})
//method to calculate due date (14 days from borrowedAt)
borrowSchema.methods.calculateDueDate = function() {
    const dueDate = new Date(this.borrowedAt);
    dueDate.setDate(dueDate.getDate() + 14);
    return dueDate;
};

const Borrow = mongoose.model("borrow", borrowSchema);

export default Borrow