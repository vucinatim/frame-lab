# Fantasy Hero Character Generator

This feature allows you to generate fantasy hero characters in T-pose using Replicate's Flux Schnell model.

## Setup

1. **Environment Variables**: Make sure you have your Replicate API token set in `.env.local`:
   ```
   REPLICATE_API_TOKEN=your_token_here
   ```

2. **Get Replicate API Token**: 
   - Sign up at [replicate.com](https://replicate.com/signin)
   - Generate an API token at [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens)

## Usage

### API Endpoint

**POST** `/api/generate-character`

Request body:
```json
{
  "prompt": "with golden armor, wielding a sword, red hair",
  "characterType": "warrior"
}
```

Response:
```json
{
  "id": "prediction_id",
  "status": "starting",
  "output": ["image_url"]
}
```

### Frontend Component

The `CharacterGenerator` component provides a user-friendly interface:

- **Character Type**: Specify the type of fantasy character (e.g., warrior, mage, archer)
- **Additional Details**: Add specific details like armor, weapons, appearance
- **Real-time Status**: Shows generation progress and final result

### Test the Feature

Visit `/character-generator` to test the character generation functionality.

## Features

- **T-pose Standardization**: All generated characters are in T-pose for consistency
- **Fantasy Hero Focus**: Optimized prompts for fantasy character generation
- **High Quality**: Uses Flux Schnell model for high-quality image generation
- **Real-time Polling**: Automatically checks generation status until completion
- **Error Handling**: Comprehensive error handling and user feedback

## Technical Details

- **Model**: `black-forest-labs/flux-schnell` (High-quality image generation)
- **Image Size**: 768x768 pixels
- **Pose**: T-pose (arms extended horizontally)
- **Style**: Fantasy hero with detailed armor and equipment
- **View**: Front view, centered composition
- **Quality**: Premium model for high-quality character generation

## Integration

You can integrate the character generator into your existing pose editor by:

1. Using the generated character as input for your pose editor
2. Calling the API endpoint programmatically
3. Adding the `CharacterGenerator` component to your existing UI

## Example Prompts

- `"warrior with steel armor, wielding a battle axe"`
- `"mage with flowing robes, holding a staff"`
- `"archer with leather armor, carrying a bow"`
- `"paladin with golden armor, wielding a holy sword"` 