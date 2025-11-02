import mongoose from "mongoose";

const borrowSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Book"
    },
    dueDate: {
        type: Date,
        required: true
    },
    returnedAt: {
        type: Date,
        default: null
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
borrowSchema.index({ userId: 1, createdAt: -1 });
borrowSchema.index({ bookId: 1, createdAt: -1 });

//use virtual to check if overdue (overdue is a property)
borrowSchema.virtual("isOverdue").get(function() {
    return !this.returnedAt && new Date() > this.dueDate;
});

const Borrow = mongoose.model("borrow", borrowSchema);

export default Borrow