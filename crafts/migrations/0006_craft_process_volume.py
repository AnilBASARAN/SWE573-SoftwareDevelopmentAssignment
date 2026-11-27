from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [('crafts', '0005_tag_craft_tags')]
    operations = [
        migrations.AddField(model_name='craft', name='production_process',
                            field=models.TextField(blank=True, default='')),
        migrations.AddField(model_name='craft', name='volume',
                            field=models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)),
    ]
