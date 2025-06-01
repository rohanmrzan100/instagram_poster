import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  InstagramService,
  PublishContent,
} from 'src/instagram/instagram.service';

@Injectable()
export class TaskService {
  constructor(private instagramService: InstagramService) {}
  private content: PublishContent[] = [
    {
      author: 'Dostoevsky',
      quote:
        'Sometimes I think that to feel too deeply is a curse, not a gift. The world does not ask for depth—it wants cheerfulness, simplicity, obedience. But the heart rebels. It wants to know, to suffer, to burn. And so it burns—quietly, endlessly, without anyone ever knowing.',
      caption:
        'Fyodor Dostoevsky was a Russian novelist and philosopher known for his profound psychological insight and exploration of moral dilemmas. His works, including *Crime and Punishment* and *The Brothers Karamazov*, delve into themes like guilt, free will, and faith. Dostoevsky’s writing profoundly shaped modern literature and existential thought.\n\n#dostoevsky #philosophy #deep #existential #quotes #soul',
    },
    {
      author: 'Dostoevsky',
      quote:
        'Freedom is not in choosing between tea or coffee, nor in voting once every four years. True freedom is being able to look into the abyss of your soul and not flinch. It is standing naked before your own conscience and saying: ‘Yes, this is who I am.’',
      caption:
        'Fyodor Dostoevsky’s works are rich with existential inquiry and spiritual introspection. He often questioned the meaning of true freedom, faith, and moral responsibility, challenging readers to confront the uncomfortable truths within themselves.\n\n#dostoevsky #freedom #existentialism #soulsearching #quotes #deepthoughts',
    },
    {
      author: 'Dostoevsky',
      quote:
        'They say love is joy, but they forget how often it walks with despair. To love is to be vulnerable to everything—the gaze, the silence, the turning away. And still, we love. Not because it saves us, but because in that pain, we find a strange kind of salvation.',
      caption:
        'Dostoevsky captured the paradox of love with brutal honesty—its power to elevate and destroy, often in the same breath. For him, love was both suffering and redemption, a sacred pain that brings us closer to our own humanity.\n\n#dostoevsky #love #pain #truth #quotes #literature',
    },
    {
      author: 'Dostoevsky',
      quote:
        'Man is a creature who can get used to anything, and that is both his triumph and his tragedy. Put him in a cage, he’ll decorate it. Give him chains, he’ll polish them. We adapt, yes—but in doing so, how much of our soul do we lose?',
      caption:
        'With piercing insight, Dostoevsky explored the tension between human resilience and spiritual decay. His reflections on conformity, survival, and the loss of self still haunt readers today.\n\n#dostoevsky #philosophy #adaptation #humancondition #quotes #thoughtprovoking',
    },
    {
      author: 'Dostoevsky',
      quote:
        'I have seen kind men do cruel things, and cruel men weep like children. There are no pure souls, no demons walking on two legs. We are all tangled—light and dark, pride and guilt. And if you look closely enough, you will find yourself in even your enemy’s face.',
      caption:
        'Dostoevsky dismantled the myth of moral purity. His characters often embodied contradiction and complexity, revealing that human nature is never simply good or evil—but always both.\n\n#dostoevsky #humanity #goodandevil #quotes #philosophy #literature',
    },
    {
      author: 'Dostoevsky',
      quote:
        'There is a suffering that asks for no witness, that hides itself behind smiles and conversations. It sits quietly inside the ribs, watching the world go on. And when the door is shut and the lights go out, it stretches out, finally alone, finally free to ache.',
      caption:
        'Through the silent grief of his characters, Dostoevsky showed that the deepest pain is often the most private. His writing reminds us that many carry invisible burdens masked by everyday life.\n\n#dostoevsky #suffering #mentalhealth #quotes #introspection',
    },
    {
      author: 'Dostoevsky',
      quote:
        'To be loved for who you pretend to be is worse than being unloved altogether. For every smile given to the mask is a wound to the soul beneath it. And in time, you forget which is the real you—the one smiling, or the one screaming behind the smile.',
      caption:
        'Dostoevsky exposed the tragedy of inauthenticity and the quiet destruction of self that comes from wearing a mask too long. His words resonate with those who feel unseen even while surrounded.\n\n#dostoevsky #authenticity #identity #soul #quotes #truth',
    },
    {
      author: 'Pablo Neruda',
      quote:
        'Love is so short, forgetting is so long. There are wounds that stay open, invisible to the eye but loud in silence, echoing between the bones where memory has no mercy.',
      caption:
        'Pablo Neruda was a Chilean poet and diplomat, celebrated for his passionate and sensuous verse that captures the essence of love, longing, and political struggle. His works, including *Twenty Love Poems and a Song of Despair* and *The Captain’s Verses*, speak to the soul with vivid imagery and emotional intensity. Neruda’s poetry remains a timeless tribute to the beauty and pain of human experience.\n\n#neruda #poetry #love #deep #quotes #romantic #literature',
    },
    {
      author: 'Rainer Maria Rilke',
      quote:
        'Perhaps all the dragons in our lives are princesses waiting only for a moment of beauty or courage. And perhaps everything terrible is in its deepest being something helpless that wants help from us.',
      caption:
        'Rainer Maria Rilke was an Austrian poet whose works explore the beauty and terror of human existence. His poetic letters and meditations invite readers to embrace uncertainty and transform suffering into creative insight.\n\n#rilke #poetry #transformation #quotes #existentialism #beauty',
    },
    {
      author: 'Sylvia Plath',
      quote:
        'I talk to God but the sky is empty. What remains is the hum of old desires, the soft ache of vanished days, and the sharp sweetness of things never said.',
      caption:
        'Sylvia Plath was an American poet known for her raw, confessional style and emotional intensity. Her work captured the inner turbulence of the self—love, depression, longing—with haunting beauty.\n\n#sylviaplath #poetry #confessional #loss #quotes #soul',
    },
    {
      author: 'Kahlil Gibran',
      quote:
        'Your joy is your sorrow unmasked. And the selfsame well from which your laughter rises was oftentimes filled with your tears. The deeper that sorrow carves into your being, the more joy you can contain.',
      caption:
        'Kahlil Gibran was a Lebanese-American writer, philosopher, and poet best known for *The Prophet*. His spiritual prose transcends borders, exploring universal themes of love, sorrow, and the human journey.\n\n#gibran #wisdom #poetry #joyandsorrow #spirituality #quotes',
    },
  ];

  private readonly logger = new Logger(TaskService.name);
  private currentIndex = 0;
  @Cron(CronExpression.EVERY_2_HOURS)
  async handleCron() {
    if (this.content.length === 0) {
      this.logger.warn('No content to publish');
      return;
    }
    const currentContent = this.content[this.currentIndex];
    await this.instagramService.publishContent(currentContent);
    this.currentIndex = (this.currentIndex + 1) % this.content.length;
  }
}
