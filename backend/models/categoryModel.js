import mongoose from 'mongoose';
/**
 * Category Schema
 */
const categorySchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: false
        }
    },
    {
        timestamps: true
    }
);

const Category = mongoose.model('Category', categorySchema);

export default Category;