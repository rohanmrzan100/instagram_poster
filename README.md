```
ffmpeg -framerate 1/60 -i image.png  -i sound.mp3  -map 0:v -map 1:a -r 25 -c:v h264 -tune stillimage -crf 18 -c:a aac -b:a 128k -ac 2 -ar 44100 -pix_fmt yuv420p -max_muxing_queue_size 1024 -shortest your_final_instagram_video.mp4

```

```
docker build -t instagram .
docker stop instagram
docker run  --env-file .env -d --rm -p 4000:3000 --name instagram instagram

docker exec -it instagram sh
```

'Fyodor Dostoevsky was a Russian novelist and philosopher known for his profound psychological insight and exploration of moral dilemmas. His works, including _Crime and Punishment_ and _The Brothers Karamazov_, delve into themes like guilt, free will, and faith. Dostoevsky’s writing profoundly shaped modern literature and existential thought. \n \n #dostoevsky #poetry #deep #love #quotes #philosophy

Pablo Neruda was a Chilean poet and diplomat, celebrated for his passionate and sensuous verse that captures the essence of love, longing, and political struggle. His works, including Twenty Love Poems and a Song of Despair and The Captain’s Verses, speak to the soul with vivid imagery and emotional intensity. Neruda’s poetry remains a timeless tribute to the beauty and pain of human experience.

#neruda #poetry #love #deep #quotes #romantic #literature



https://www.instagram.com/aailagulu/reels/


https://www.instagram.com/footy_goat_suii/reels/
