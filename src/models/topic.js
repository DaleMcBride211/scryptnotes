import mongoose, { Schema } from 'mongoose';

const topicSchema = new Schema(
    {
        title: {
            type: String,
        },
        description: {
            type: Schema.Types.Mixed,
        },
    },
    {
        timestamps:true
    }
);

const Topic = mongoose.models.Topic || mongoose.model('Topic', topicSchema);

export default Topic;