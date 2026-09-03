// Service layer irraa business logic waamuf import gochuu
import { 
    createConversationService, 
    getConversationsService 
} from '../service/chat.service.js';

/**
 * Controller gaaffii haaraa (POST request) keessummeessu
 * User prompt fudhatees Gemini API fi Database wajjin walqabsiisa
 */
export async function createConversationController(req, res, next) {
    try {
        // Request body irraa text gaaffii (question) baasuu
        const { question } = req.body;

        // Service waamuun prompt erguu fi history haaraa deebi'u fudhachuu
        const history = await createConversationService(question);

        // Client-f HTTP status 201 Created fi data history JSON bifaatiin deebisuu
        return res.status(201).json({
            success: true,
            message: 'Conversation posted successfully.',
            data: history
        });
    } catch (error) {
        // Error uumame koodii Express error-handling middleware-tti dabarsuu
        next(error);
    }
}

/**
 * Controller seenaa marii darban (GET request) fidu
 * Conversations 100 dhiyeenya galan deebisa
 */
export async function getConversationsController(req, res, next) {
    try {
        // Service irraa conversation history 100 fiduu
        const history = await getConversationsService();

        // Client-f HTTP status 200 OK fi array history JSON bifaatiin deebisuu
        return res.status(200).json({ 
            success: true,
            message: 'Conversations fetched successfully.',
            data: history
        });
    } catch (error) {
        // Error uumame middleware-tti dabarsuu
        next(error);
    }
}