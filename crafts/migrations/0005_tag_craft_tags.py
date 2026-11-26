from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('crafts', '0004_craft_owner')]
    operations = [
        migrations.CreateModel(
            name='Tag',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50, unique=True)),
            ],
        ),
        migrations.AddField(
            model_name='craft',
            name='tags',
            field=models.ManyToManyField(blank=True, related_name='crafts', to='crafts.tag'),
        ),
    ]
